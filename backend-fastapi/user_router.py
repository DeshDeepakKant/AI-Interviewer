from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from models import UserCreate, UserInDB
from pydantic import BaseModel
from bson import ObjectId
import jwt
import os
import re
import bcrypt
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/user", tags=["user"])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, os.getenv("ACCESS_TOKEN_SECRET", "secret"), algorithm="HS256")

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    secret = os.getenv("REFRESH_TOKEN_SECRET", os.getenv("ACCESS_TOKEN_SECRET", "secret"))
    return jwt.encode(to_encode, secret, algorithm="HS256")

async def get_current_user(request: Request):
    token = request.cookies.get("accessToken")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        payload = jwt.decode(token, os.getenv("ACCESS_TOKEN_SECRET", "secret"), algorithms=["HS256"])
        user_id: str = payload.get("_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = await request.app.mongodb["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
        
    user["_id"] = str(user["_id"])
    return UserInDB(**user)

@router.post("/signUp")
async def sign_up(user: UserCreate, request: Request):
    db = request.app.mongodb
    if await db["users"].find_one({"$or": [{"email": user.email}, {"username": user.username}]}):
        raise HTTPException(status_code=400, detail="User already exists")
        
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    
    result = await db["users"].insert_one(user_dict)
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    return {"success": True, "data": UserInDB(**created_user)}

@router.post("/login")
async def login(request: Request, response: Response):
    body = await request.json()
    identifier = (body.get("email") or body.get("username") or "").strip()
    password = (body.get("password") or "").strip()
    
    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Username/email and password are required")
        
    db = request.app.mongodb
    
    # 1. Direct or case-insensitive search
    regex_pattern = f"^{re.escape(identifier)}$"
    user = await db["users"].find_one({
        "$or": [
            {"email": {"$regex": regex_pattern, "$options": "i"}},
            {"username": {"$regex": regex_pattern, "$options": "i"}}
        ]
    })
    
    # 2. Friendly demo aliases (e.g. "alex" -> "student_alex", "sarah" -> "employer_sarah")
    if not user:
        aliases = {
            "alex": "student@demo.ai",
            "student": "student@demo.ai",
            "sarah": "employer@demo.ai",
            "employer": "employer@demo.ai",
            "david": "admin@demo.ai",
            "admin": "admin@demo.ai"
        }
        alias_email = aliases.get(identifier.lower())
        if alias_email:
            user = await db["users"].find_one({"email": alias_email})
            
    if not user or not verify_password(password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
        
    user_id_str = str(user["_id"])
    access_token = create_access_token({"_id": user_id_str})
    refresh_token = create_refresh_token({"_id": user_id_str})
    
    response.set_cookie(key="accessToken", value=access_token, httponly=True, max_age=86400, secure=True, samesite="none")
    response.set_cookie(key="refreshToken", value=refresh_token, httponly=True, max_age=604800, secure=True, samesite="none")
    
    user["_id"] = user_id_str
    user_data = UserInDB(**user).dict(by_alias=True)
    
    return {
        "success": True,
        "message": "Logged in successfully",
        "data": {
            "user": user_data,
            "accessToken": access_token,
            "refreshToken": refresh_token
        }
    }

class RefreshTokenRequest(BaseModel):
    refreshToken: Optional[str] = None

@router.post("/refresh-token")
async def refresh_token(request: Request, response: Response, payload: Optional[RefreshTokenRequest] = None):
    token = None
    if payload and payload.refreshToken:
        token = payload.refreshToken
    if not token:
        token = request.cookies.get("refreshToken")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    try:
        secret = os.getenv("REFRESH_TOKEN_SECRET", os.getenv("ACCESS_TOKEN_SECRET", "secret"))
        data = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = data.get("_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    db = request.app.mongodb
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User associated with token not found")
        
    user_id_str = str(user["_id"])
    new_access_token = create_access_token({"_id": user_id_str})
    new_refresh_token = create_refresh_token({"_id": user_id_str})
    
    response.set_cookie(key="accessToken", value=new_access_token, httponly=True, max_age=86400, secure=True, samesite="none")
    response.set_cookie(key="refreshToken", value=new_refresh_token, httponly=True, max_age=604800, secure=True, samesite="none")
    
    return {
        "success": True,
        "message": "Token refreshed successfully",
        "data": {
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token
        }
    }

@router.get("/currentUser")
async def current_user(current_user: UserInDB = Depends(get_current_user)):
    return {"success": True, "data": current_user}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken")
    return {"success": True, "message": "Logged out successfully"}
