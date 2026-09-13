from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from models import UserInDB
from user_router import get_current_user
from interview_graph import generate_interview_analysis
from pydantic import BaseModel
import uuid
import os
import json
import io
from pypdf import PdfReader
from bson import ObjectId
from redis_store import redis_client

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

class AnalysisRequest(BaseModel):
    sessionId: str

@router.post("/aiUploadResume")
async def ai_upload_resume(request: Request, resumePdf: UploadFile = File(...), current_user: UserInDB = Depends(get_current_user)):
    try:
        session_id = str(uuid.uuid4())
        content = await resumePdf.read()
        
        # In-memory PDF parsing without writing temporary files to disk
        reader = PdfReader(io.BytesIO(content))
        doc_resume = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        
        if not doc_resume:
            raise HTTPException(status_code=400, detail="Resume file is empty or could not be parsed")
            
        await redis_client.hset(session_id, mapping={
            "userId": str(current_user.id),
            "resume": doc_resume
        })
        await redis_client.expire(session_id, 7200)
        
        return {"success": True, "data": {"sessionId": session_id}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@router.post("/ai")
async def ai_interview_way(request: Request, current_user: UserInDB = Depends(get_current_user)):
    body = await request.json()
    position = body.get("position")
    experience_level = body.get("experienceLevel")
    num_questions = body.get("numberOfQuestionYouShouldAsk")
    session_id = body.get("sessionId")
    interview_mode = body.get("interviewMode", "Guided Mode")
    job_id = body.get("jobId") # From employer link if applicable
    
    if not all([position, experience_level, num_questions, session_id]):
        raise HTTPException(status_code=400, detail="Missing required fields: position, experienceLevel, numberOfQuestionYouShouldAsk, sessionId")
        
    db = request.app.mongodb
    is_mock = True
    employer_id = ""
    is_feedback_hidden = False
    
    if job_id:
        try:
            job = await db["jobcampaigns"].find_one({"_id": ObjectId(job_id)})
            if job:
                is_mock = False
                employer_id = str(job["employerId"])
                is_feedback_hidden = job.get("isFeedbackHidden", True)
        except Exception as e:
            print(f"Invalid job_id or error querying job: {e}")
            
    await redis_client.hset(session_id, mapping={
        "position": position,
        "experienceLevel": experience_level,
        "numberOfQuestionYouShouldAsk": str(num_questions),
        "numberOfQuestionLeft": str(num_questions),
        "interviewMode": interview_mode,
        "jobId": job_id if job_id else "",
        "employerId": employer_id,
        "isMock": "1" if is_mock else "0",
        "isFeedbackHidden": "1" if is_feedback_hidden else "0",
        "count": "0",
        "messages": json.dumps([]),
        "aiExplanation": json.dumps([])
    })
    
    return {"success": True, "data": {"numberOfQuestion": num_questions}}

@router.post("/aiInterviewAnalysis")
@router.post("/aiAnalysis")
async def ai_interview_analysis(
    request: Request,
    payload: AnalysisRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    session_id = payload.sessionId
    db = request.app.mongodb
    session_data = await redis_client.hgetall(session_id)
    
    if not session_data:
        raise HTTPException(status_code=404, detail="Interview session not found or has expired in cache")
        
    session_data = {k.decode('utf-8'): v.decode('utf-8') for k, v in session_data.items()}
    messages = json.loads(session_data.get("messages", "[]"))
    resume_text = session_data.get("resume", "")
    position = session_data.get("position", "Software Engineer")
    experience_level = session_data.get("experienceLevel", "Mid Level")
    is_mock = session_data.get("isMock", "1") == "1"
    job_id = session_data.get("jobId") or None
    employer_id = session_data.get("employerId") or None
    
    # Run LangChain comprehensive evaluation
    analysis_res = await generate_interview_analysis(resume_text, position, experience_level, messages)
    
    qa_items = [
        {
            "question": q.question,
            "userAnswer": q.userAnswer,
            "feedback": q.feedback,
            "rating": q.rating,
            "technicalKnowledge": q.technicalKnowledge,
            "problemSolvingSkills": q.problemSolvingSkills,
            "communicationClarity": q.communicationClarity,
            "suggestedAnswer": q.suggestedAnswer
        }
        for q in analysis_res.analysis
    ]
    
    history_doc = {
        "userId": str(current_user.id),
        "jobId": job_id,
        "employerId": employer_id,
        "isMock": is_mock,
        "interviewName": analysis_res.interviewName,
        "interviewMode": session_data.get("interviewMode", "Guided Mode"),
        "mockInterViewName": analysis_res.interviewName,
        "resumeSummary": analysis_res.resumeSummary,
        "experienceLevel": experience_level,
        "position": position,
        "mockType": "Mock Interview" if is_mock else "Official Employer Interview",
        "explanations": [],
        "numberOfQuestions": len(qa_items),
        "overAllRating": analysis_res.overAllRating,
        "overallTechnicalKnowledge": analysis_res.overallTechnicalKnowledge,
        "overallProblemSolving": analysis_res.overallProblemSolving,
        "overallCommunicationClarity": analysis_res.overallCommunicationClarity,
        "qaItems": qa_items
    }
    
    result = await db["historysessions"].insert_one(history_doc)
    history_doc["_id"] = str(result.inserted_id)
    
    # Privacy redaction: if official employer interview and candidate views it
    if not is_mock and current_user.role == "student":
        history_doc["qaItems"] = []
        history_doc["overAllRating"] = None
        history_doc["overallTechnicalKnowledge"] = None
        history_doc["overallProblemSolving"] = None
        history_doc["overallCommunicationClarity"] = None
        history_doc["resumeSummary"] = "Results are hidden for official employer interviews."
        
    return {"success": True, "message": "Interview analyzed and saved successfully", "data": history_doc}
    
@router.get("/aiHistory")
async def ai_history(
    request: Request,
    page: int = 1,
    limit: int = 10,
    current_user: UserInDB = Depends(get_current_user)
):
    db = request.app.mongodb
    total_count = await db["historysessions"].count_documents({"userId": current_user.id})
    skip = max(0, (page - 1) * limit)
    
    # Sort by createdAt descending if present, fallback natural
    history = await db["historysessions"].find({"userId": current_user.id}).skip(skip).limit(limit).to_list(limit)
    
    for h in history:
        h["_id"] = str(h["_id"])
        # If it's a real interview and candidate is viewing, hide feedback
        if not h.get("isMock", True) and current_user.role == "student":
            h["qaItems"] = []
            h["overAllRating"] = None
            h["overallTechnicalKnowledge"] = None
            h["overallProblemSolving"] = None
            h["overallCommunicationClarity"] = None
            h["resumeSummary"] = "Results are hidden for official employer interviews."
            
    total_pages = max(1, (total_count + limit - 1) // limit) if total_count else 1
    
    return {
        "success": True,
        "data": {
            "data": history,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_count,
                "itemsPerPage": limit,
                "hasNextPage": page < total_pages,
                "hasPrevPage": page > 1
            }
        }
    }
