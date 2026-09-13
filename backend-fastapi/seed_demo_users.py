import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from bson import ObjectId

DEMO_USERS = [
    {
        "fixed_id": "650000000000000000000001",
        "username": "student_alex",
        "email": "student@demo.ai",
        "fullName": "Alex Carter (Candidate)",
        "role": "student",
        "raw_password": "StudentPass123!",
        "authProvider": "local"
    },
    {
        "fixed_id": "650000000000000000000002",
        "username": "employer_sarah",
        "email": "employer@demo.ai",
        "fullName": "Sarah Jenkins (Tech Recruiter)",
        "role": "employer",
        "raw_password": "EmployerPass123!",
        "authProvider": "local"
    },
    {
        "fixed_id": "650000000000000000000003",
        "username": "admin_david",
        "email": "admin@demo.ai",
        "fullName": "David Miller (System Admin)",
        "role": "admin",
        "raw_password": "AdminPass123!",
        "authProvider": "local"
    }
]

async def seed_db(db):
    employer_id = None
    for user_data in DEMO_USERS:
        user = dict(user_data)
        raw_pw = user.pop("raw_password")
        fixed_id = user.pop("fixed_id", None)
        if fixed_id:
            user["_id"] = ObjectId(fixed_id)
            
        user["password"] = bcrypt.hashpw(raw_pw.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")
        
        # Upsert user by email
        existing = await db["users"].find_one({"email": user["email"]})
        if existing:
            user.pop("_id", None)
            await db["users"].update_one({"_id": existing["_id"]}, {"$set": user})
            user_id = existing["_id"]
            print(f"[Seed] Updated demo user: {user['email']} ({user['role']})")
        else:
            res = await db["users"].insert_one(user)
            user_id = res.inserted_id
            print(f"[Seed] Created demo user: {user['email']} ({user['role']})")
            
        if user["role"] == "employer":
            employer_id = str(user_id)
            
    # Seed a sample Job Campaign for the Employer
    if employer_id:
        sample_job = {
            "_id": ObjectId("650000000000000000000010"),
            "employerId": employer_id,
            "title": "Full Stack AI Engineer",
            "description": "Building next-generation generative AI interview and evaluation pipelines with FastAPI and React.",
            "requiredSkills": ["Python", "FastAPI", "React", "LangGraph", "System Design"],
            "experienceLevel": "Mid to Senior Level",
            "numberOfQuestions": 5,
            "isFeedbackHidden": True,
            "isActive": True,
            "createdAt": datetime.utcnow()
        }
        
        existing_job = await db["jobcampaigns"].find_one({"employerId": employer_id, "title": sample_job["title"]})
        if not existing_job:
            job_res = await db["jobcampaigns"].insert_one(sample_job)
            print(f"[Seed] Created demo Job Campaign: '{sample_job['title']}' (Job ID: {job_res.inserted_id})")
        else:
            print(f"[Seed] Demo Job Campaign already exists (Job ID: {existing_job['_id']})")
            
        # Seed sample candidate interview evaluation sessions
        sample_candidate_id = "650000000000000000000001" # Alex
        sample_job_id = "650000000000000000000010"
        
        existing_session = await db["historysessions"].find_one({"userId": sample_candidate_id})
        if not existing_session:
            session_alex = {
                "userId": sample_candidate_id,
                "candidateName": "Alex Carter (Candidate)",
                "candidateEmail": "student@demo.ai",
                "jobId": sample_job_id,
                "employerId": employer_id,
                "isMock": False,
                "interviewName": "Full Stack AI Engineer - System Architecture & LangGraph",
                "interviewMode": "Technical Assessment",
                "mockInterViewName": "Full Stack AI Engineer - System Architecture & LangGraph",
                "resumeSummary": "Proficient in Python, FastAPI, React 19, LangGraph, and distributed systems. Built asynchronous LLM evaluation pipelines with Redis session state.",
                "experienceLevel": "Mid to Senior Level",
                "position": "Full Stack AI Engineer",
                "mockType": "Official Employer Interview",
                "numberOfQuestions": 4,
                "overAllRating": 8.8,
                "overallTechnicalKnowledge": 9.0,
                "overallProblemSolving": 8.6,
                "overallCommunicationClarity": 8.8,
                "createdAt": datetime.utcnow(),
                "qaItems": [
                    {
                        "question": "How do you handle cyclical execution and state persistence in LangGraph compared to standard sequential chains?",
                        "userAnswer": "In LangGraph, we define a TypedDict state and nodes as async functions. Conditional edges inspect the state to dynamically route between nodes, allowing loops like drill-down feedback until a termination condition is met. State is checkpointed into memory or Redis.",
                        "feedback": "Exceptional explanation of state graph cycles and conditional edges. Accurately contrasted with static DAGs.",
                        "rating": 9,
                        "technicalKnowledge": 9,
                        "problemSolvingSkills": 9,
                        "communicationClarity": 9,
                        "suggestedAnswer": "LangGraph models agent workflows as state machines where cycles and loops are first-class citizens. Using a centralized state schema with reducers and checkpointers (e.g. Redis or Postgres), each node modifies state and conditional router edges evaluate criteria before advancing or looping back."
                    },
                    {
                        "question": "How do you prevent WebSocket connection drops and scale real-time session state horizontally?",
                        "userAnswer": "We use Redis as an external pub/sub channel and shared session cache. WebSockets can reconnect and resume state from Redis using the unique sessionId without tying the user to a specific backend server instance.",
                        "feedback": "Clear understanding of horizontal scaling with external message brokers and stateless app instances.",
                        "rating": 9,
                        "technicalKnowledge": 9,
                        "problemSolvingSkills": 8,
                        "communicationClarity": 9,
                        "suggestedAnswer": "To horizontally scale WebSockets, leverage an ASGI framework behind an Nginx load balancer with sticky sessions or a Redis-backed Socket.IO manager. Session dialogue history is stored in Redis hashes with TTLs so any worker node can service reconnections."
                    }
                ]
            }
            await db["historysessions"].insert_one(session_alex)
            print("[Seed] Created sample candidate interview report for Alex Carter")

async def seed():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "ai_interviewer")
    
    print(f"Connecting to MongoDB at: {mongo_uri} (DB: {db_name})...")
    client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=4000)
    
    try:
        await client.admin.command('ping')
        print("Connected successfully to MongoDB.")
    except Exception as e:
        print(f"\n[!] Notice: Could not connect to MongoDB server at {mongo_uri}.")
        print(f"    Error: {e}")
        print("    If you are using MongoDB Atlas, make sure to set MONGODB_URI in your backend-fastapi/.env file.")
        return

    db = client[db_name]
    await seed_db(db)
    print("\nSeeding complete! You can now log in using these demo accounts.")

if __name__ == "__main__":
    asyncio.run(seed())
