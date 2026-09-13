from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    fullName: str
    role: str = "student" # "student", "employer", "admin"
    authProvider: str = "local" # "local" or "google"
    googleId: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None # Optional because Google Auth won't have a password

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    avatar: Optional[dict] = None
    refreshToken: Optional[str] = None
    
    class Config:
        populate_by_name = True

class QaItem(BaseModel):
    question: str
    userAnswer: str
    feedback: Optional[str] = None
    rating: Optional[int] = None
    suggestedAnswer: Optional[str] = None
    technicalKnowledge: Optional[int] = None
    problemSolvingSkills: Optional[int] = None
    communicationClarity: Optional[int] = None

class ExplanationItem(BaseModel):
    question: str
    explanation: str

class HistorySession(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    userId: str
    jobId: Optional[str] = None
    employerId: Optional[str] = None
    isMock: bool = True
    interviewName: Optional[str] = None
    interviewMode: str = "Medium Mode"
    mockInterViewName: Optional[str] = None
    resumeSummary: Optional[str] = None
    experienceLevel: Optional[str] = None
    position: Optional[str] = None
    mockType: str = "Mock Interview"
    explanations: List[ExplanationItem] = []
    numberOfQuestions: Optional[int] = None
    overAllRating: Optional[float] = None
    overallTechnicalKnowledge: Optional[float] = None
    overallProblemSolving: Optional[float] = None
    overallCommunicationClarity: Optional[float] = None
    qaItems: List[QaItem] = []
    
    class Config:
        populate_by_name = True

class JobCampaign(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    employerId: str
    title: str
    description: str
    requiredSkills: List[str]
    experienceLevel: str
    numberOfQuestions: int = 5
    isFeedbackHidden: bool = True
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
