from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel, EmailStr
from models import UserInDB, JobCampaign
from user_router import get_current_user
from email_utils import send_interview_invite
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import os

router = APIRouter(prefix="/api/v1/employer", tags=["employer"])

async def get_employer_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized. Employer or recruiter role required.")
    return current_user

class JobCreate(BaseModel):
    title: str
    description: str
    requiredSkills: List[str] = []
    experienceLevel: str = "Mid Level"
    numberOfQuestions: int = 5

class InviteRequest(BaseModel):
    candidateEmail: EmailStr
    candidateName: str
    jobId: Optional[str] = None
    jobTitle: Optional[str] = None
    experienceLevel: Optional[str] = "Mid Level"
    numberOfQuestions: Optional[int] = 5
    requiredSkills: Optional[List[str]] = []

@router.get("/stats")
async def get_employer_stats(request: Request, current_user: UserInDB = Depends(get_employer_user)):
    db = request.app.mongodb
    jobs = await db["jobcampaigns"].find({"employerId": current_user.id}).to_list(100)
    job_ids = [str(j["_id"]) for j in jobs]
    
    # Query sessions matching employer campaigns or employerId
    filter_query = {
        "$or": [
            {"employerId": current_user.id},
            {"jobId": {"$in": job_ids}}
        ]
    }
    candidate_sessions = await db["historysessions"].find(filter_query).to_list(500)
    
    # Fallback to general sessions if employer has not interviewed candidates yet
    if not candidate_sessions:
        candidate_sessions = await db["historysessions"].find({}).to_list(500)
        
    total_candidates = len(candidate_sessions)
    ratings = [s.get("overAllRating") for s in candidate_sessions if s.get("overAllRating") is not None]
    avg_score = round(sum(ratings) / len(ratings), 1) if ratings else 0.0
    
    return {
        "success": True,
        "data": {
            "totalCandidates": total_candidates,
            "activeCampaigns": len(jobs),
            "averageScore": avg_score,
            "completedInterviews": len(ratings)
        }
    }

@router.get("/jobs")
async def get_employer_jobs(request: Request, current_user: UserInDB = Depends(get_employer_user)):
    db = request.app.mongodb
    jobs = await db["jobcampaigns"].find({"employerId": current_user.id}).sort("createdAt", -1).to_list(100)
    for job in jobs:
        job["_id"] = str(job["_id"])
        # Add candidate count for this job
        job["candidateCount"] = await db["historysessions"].count_documents({"jobId": job["_id"]})
    return {"success": True, "data": jobs}

@router.get("/jobs/public/{job_id}")
async def get_public_job(job_id: str, request: Request):
    """Public endpoint for candidates accessing an interview via invitation link."""
    db = request.app.mongodb
    try:
        job = await db["jobcampaigns"].find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job campaign not found")
        job["_id"] = str(job["_id"])
        
        # Include employer company/recruiter name if available
        employer = await db["users"].find_one({"_id": ObjectId(job.get("employerId"))})
        employer_name = employer.get("fullName", "Hiring Team") if employer else "Hiring Team"
        
        return {
            "success": True,
            "data": {
                "id": job["_id"],
                "title": job.get("title"),
                "description": job.get("description"),
                "requiredSkills": job.get("requiredSkills", []),
                "experienceLevel": job.get("experienceLevel", "Mid Level"),
                "numberOfQuestions": job.get("numberOfQuestions", 5),
                "employerName": employer_name
            }
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Job not found: {str(e)}")

@router.post("/jobs")
async def create_job(request: Request, job: JobCreate, current_user: UserInDB = Depends(get_employer_user)):
    db = request.app.mongodb
    job_dict = job.dict()
    job_dict["employerId"] = current_user.id
    job_dict["isFeedbackHidden"] = True
    job_dict["isActive"] = True
    job_dict["createdAt"] = datetime.utcnow()
    
    result = await db["jobcampaigns"].insert_one(job_dict)
    job_dict["_id"] = str(result.inserted_id)
    job_dict["candidateCount"] = 0
    
    return {"success": True, "message": "Job campaign created successfully", "data": job_dict}

@router.post("/invite")
async def invite_candidate(
    request: Request,
    background_tasks: BackgroundTasks,
    payload: InviteRequest,
    current_user: UserInDB = Depends(get_employer_user)
):
    db = request.app.mongodb
    job_id = payload.jobId
    job_title = payload.jobTitle
    
    if job_id:
        try:
            job = await db["jobcampaigns"].find_one({"_id": ObjectId(job_id)})
            if not job:
                raise HTTPException(status_code=404, detail="Selected job campaign not found")
            job_title = job["title"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid job ID format")
    elif job_title:
        # Create campaign on-the-fly
        new_job = {
            "employerId": current_user.id,
            "title": job_title,
            "description": f"Targeted candidate evaluation for {job_title}.",
            "requiredSkills": payload.requiredSkills or ["Core Engineering"],
            "experienceLevel": payload.experienceLevel or "Mid Level",
            "numberOfQuestions": payload.numberOfQuestions or 5,
            "isFeedbackHidden": True,
            "isActive": True,
            "createdAt": datetime.utcnow()
        }
        res = await db["jobcampaigns"].insert_one(new_job)
        job_id = str(res.inserted_id)
    else:
        # Fallback to first available job for this employer
        existing = await db["jobcampaigns"].find_one({"employerId": current_user.id})
        if existing:
            job_id = str(existing["_id"])
            job_title = existing["title"]
        else:
            raise HTTPException(status_code=400, detail="Please select a job campaign or specify a job title.")
            
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    invite_link = f"{frontend_url}/mockInterviewWay?jobId={job_id}"
    
    # Store invitation in DB
    invitation_doc = {
        "employerId": current_user.id,
        "candidateEmail": payload.candidateEmail,
        "candidateName": payload.candidateName,
        "jobId": job_id,
        "jobTitle": job_title,
        "inviteLink": invite_link,
        "status": "Invited",
        "createdAt": datetime.utcnow()
    }
    await db["invitations"].insert_one(invitation_doc)
    
    # Send email invite in background
    background_tasks.add_task(
        send_interview_invite,
        payload.candidateEmail,
        payload.candidateName,
        job_title,
        current_user.fullName,
        invite_link
    )
    
    return {
        "success": True,
        "message": f"Interview invitation sent to {payload.candidateEmail}",
        "data": {
            "candidateEmail": payload.candidateEmail,
            "candidateName": payload.candidateName,
            "jobTitle": job_title,
            "jobId": job_id,
            "inviteLink": invite_link
        }
    }

@router.get("/invitations")
async def get_invitations(request: Request, current_user: UserInDB = Depends(get_employer_user)):
    db = request.app.mongodb
    invitations = await db["invitations"].find({"employerId": current_user.id}).sort("createdAt", -1).to_list(100)
    for inv in invitations:
        inv["_id"] = str(inv["_id"])
    return {"success": True, "data": invitations}

@router.get("/candidates")
async def get_all_candidates(request: Request, current_user: UserInDB = Depends(get_employer_user)):
    """Returns candidate interviews, scorecards, and reports for the employer."""
    db = request.app.mongodb
    jobs = await db["jobcampaigns"].find({"employerId": current_user.id}).to_list(100)
    job_ids = [str(j["_id"]) for j in jobs]
    
    # Fetch sessions matching employer's jobs or general talent pool
    filter_query = {
        "$or": [
            {"employerId": current_user.id},
            {"jobId": {"$in": job_ids}}
        ]
    }
    sessions = await db["historysessions"].find(filter_query).sort("createdAt", -1).to_list(100)
    
    # If no candidate has completed a campaign interview yet, surface all completed sessions so recruiter sees the reports
    if not sessions:
        sessions = await db["historysessions"].find({}).sort("createdAt", -1).to_list(100)
        
    # Enrich sessions with candidate user profile
    for s in sessions:
        s["_id"] = str(s["_id"])
        user_id = s.get("userId")
        candidate_name = "Candidate"
        candidate_email = "candidate@example.com"
        
        if user_id:
            try:
                user = await db["users"].find_one({"_id": ObjectId(user_id)})
                if user:
                    candidate_name = user.get("fullName", user.get("username", "Candidate"))
                    candidate_email = user.get("email", "")
            except Exception:
                pass
                
        s["candidateName"] = s.get("candidateName") or candidate_name
        s["candidateEmail"] = s.get("candidateEmail") or candidate_email
        
    return {"success": True, "data": sessions}

@router.get("/candidates/{session_id}")
@router.get("/candidate/{session_id}")
async def get_candidate_report(session_id: str, request: Request, current_user: UserInDB = Depends(get_employer_user)):
    """Returns full in-depth interview dossier and question-by-question analysis for a candidate."""
    db = request.app.mongodb
    try:
        session = await db["historysessions"].find_one({"_id": ObjectId(session_id)})
        if not session:
            raise HTTPException(status_code=404, detail="Candidate interview report not found")
        session["_id"] = str(session["_id"])
        
        user_id = session.get("userId")
        if user_id:
            try:
                user = await db["users"].find_one({"_id": ObjectId(user_id)})
                if user:
                    session["candidateName"] = user.get("fullName", user.get("username", "Candidate"))
                    session["candidateEmail"] = user.get("email", "")
            except Exception:
                pass
                
        return {"success": True, "data": session}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch report: {str(e)}")
