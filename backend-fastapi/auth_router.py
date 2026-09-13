from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from models import UserInDB
from user_router import create_access_token
import os
from bson import ObjectId

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class GoogleAuthRequest(BaseModel):
    token: str
    role: str = "student" # Default to student if not provided

@router.post("/google")
async def google_auth(request: Request, response: Response, payload: GoogleAuthRequest):
    try:
        # Verify the Google token
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            # Fallback for dev if not provided
            print("WARNING: GOOGLE_CLIENT_ID not set. Accepting token for testing purposes.")
            user_info = {"email": "mock@google.com", "name": "Mock User", "sub": "123456789"}
        else:
            user_info = id_token.verify_oauth2_token(
                payload.token, google_requests.Request(), client_id
            )

        email = user_info.get("email")
        name = user_info.get("name")
        google_id = user_info.get("sub")
        
        db = request.app.mongodb
        
        # Check if user exists
        user = await db["users"].find_one({"email": email})
        
        if not user:
            # Create new user
            new_user = {
                "username": email.split('@')[0],
                "email": email,
                "fullName": name,
                "role": payload.role if payload.role in ["student", "employer", "admin"] else "student",
                "authProvider": "google",
                "googleId": google_id,
                "password": "" # No password for Google auth
            }
            result = await db["users"].insert_one(new_user)
            user = await db["users"].find_one({"_id": result.inserted_id})
            
        elif user.get("authProvider") != "google":
            # Link google auth to existing account if desired, or throw error
            await db["users"].update_one(
                {"_id": user["_id"]}, 
                {"$set": {"googleId": google_id, "authProvider": "google"}}
            )
            
        access_token = create_access_token({"_id": str(user["_id"])})
        
        # Set cookie like local login
        response.set_cookie(key="accessToken", value=access_token, httponly=True, max_age=86400, secure=True, samesite="none")
        
        user["_id"] = str(user["_id"])
        user_data = UserInDB(**user).dict(by_alias=True)
        
        return {"success": True, "message": "Google Login successful", "data": {"user": user_data, "accessToken": access_token}}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
