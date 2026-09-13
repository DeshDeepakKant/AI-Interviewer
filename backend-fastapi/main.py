import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import socketio
from dotenv import load_dotenv

load_dotenv()

from seed_demo_users import seed_db
from redis_store import init_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Redis (with auto-fallback to FakeRedis if unhosted)
    await init_redis()
    
    # Initialize MongoDB (with auto-fallback to in-memory mongomock if unhosted)
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "ai_interviewer")
    
    try:
        real_client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=2000)
        await real_client.admin.command('ping')
        print(f"[DB] Connected successfully to MongoDB at {mongo_uri}")
        app.mongodb_client = real_client
        app.mongodb = real_client[db_name]
        await seed_db(app.mongodb)
    except Exception as e:
        print(f"[DB Notice] MongoDB not reachable at {mongo_uri} ({e}).")
        print("[DB Notice] Activating in-memory Mock MongoDB with pre-seeded demo accounts.")
        from mongomock_motor import AsyncMongoMockClient
        app.mongodb_client = AsyncMongoMockClient()
        app.mongodb = app.mongodb_client[db_name]
        await seed_db(app.mongodb)
        
    yield
    # Cleanup
    if hasattr(app, "mongodb_client"):
        app.mongodb_client.close()

app = FastAPI(lifespan=lifespan)

# HTTP Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 2)
    print(f"[HTTP] {request.method} {request.url.path} -> Status {response.status_code} ({duration}ms)")
    return response

allowed_origins = [origin.strip() for origin in os.getenv("CORS_ORIGIN", "").split(",") if origin.strip()]
print("Allowed CORS Origins:", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=allowed_origins if allowed_origins else "*")
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": int(time.time() * 1000)}

from user_router import router as user_router
from ai_router import router as ai_router
from auth_router import router as auth_router
from employer_router import router as employer_router
from socket_events import setup_socket_events

app.include_router(user_router)
app.include_router(ai_router)
app.include_router(auth_router)
app.include_router(employer_router)

setup_socket_events(sio, app)

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
