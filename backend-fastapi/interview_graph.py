import os
import json
from typing import TypedDict, List, Dict, Optional, Literal
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END

api_key = os.getenv("GEMINI_API_KEY", "dummy_key")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)

# ----------------- Schemas: Live Interview -----------------

class AnswerAssessment(BaseModel):
    evaluation_depth: Literal["weak_vague", "satisfactory", "exceptional", "off_topic_or_query", "starting"] = Field(
        description="Assessment of candidate's latest answer depth."
    )
    candidate_clarity: int = Field(description="Clarity score from 1 to 10.", ge=1, le=10)
    evaluation_rationale: str = Field(description="Brief 1-sentence internal rationale for the assessment.")

class QuestionOutput(BaseModel):
    question: str = Field(description="The exact next question or follow-up to ask the candidate.")

class ExplanationOutput(BaseModel):
    explanation: str = Field(description="Clear, point-wise explanation of the technical concept and suggested answer.")

class InterviewState(TypedDict):
    position: str
    experience_level: str
    interview_mode: str
    resume: Optional[str]
    messages: List[Dict[str, str]]
    latest_answer: str
    questions_left: int
    evaluation_depth: str
    candidate_clarity: int
    evaluation_rationale: str
    next_question: str
    drill_down: bool
    is_finished: bool

# ----------------- Schemas: Post-Interview Comprehensive Evaluation -----------------

class QuestionAnalysis(BaseModel):
    question: str = Field(description="The question that was asked.")
    userAnswer: str = Field(description="The candidate's full answer.")
    feedback: str = Field(description="Constructive, specific, actionable feedback.")
    rating: int = Field(description="Rating for this specific answer (0-10).", ge=0, le=10)
    technicalKnowledge: Optional[int] = Field(default=None, description="Score 0-10 for technical depth and accuracy.")
    problemSolvingSkills: Optional[int] = Field(default=None, description="Score 0-10 for problem-solving structure.")
    communicationClarity: Optional[int] = Field(default=None, description="Score 0-10 for clarity.")
    suggestedAnswer: str = Field(description="An ideal, expert-level model answer to the question for candidate learning.")

class InterviewAnalysisOutput(BaseModel):
    interviewName: str = Field(description="A concise title for this interview session.")
    resumeSummary: str = Field(description="Concise summary of candidate's skills and background.")
    overAllRating: float = Field(description="Holistic overall score from 0 to 10.", ge=0, le=10)
    overallTechnicalKnowledge: float = Field(description="Holistic technical knowledge score (0-10).", ge=0, le=10)
    overallProblemSolving: float = Field(description="Holistic problem solving score (0-10).", ge=0, le=10)
    overallCommunicationClarity: float = Field(description="Holistic communication clarity score (0-10).", ge=0, le=10)
    analysis: List[QuestionAnalysis] = Field(description="Per-question detailed analysis.")

# ----------------- LangGraph Nodes: Live Interview -----------------

async def assess_answer_node(state: InterviewState) -> dict:
    """Evaluates the candidate's latest answer for technical rigor and clarity."""
    messages = state.get("messages", [])
    latest_answer = (state.get("latest_answer") or "").strip()
    lower_answer = latest_answer.lower()
    
    # Handle initialization / opening triggers
    is_starting = (
        len(messages) <= 1
        or any(k in lower_answer for k in ["start", "hello", "hi", "let's start", "ready"])
    )
    if is_starting:
        return {
            "evaluation_depth": "starting",
            "candidate_clarity": 10,
            "evaluation_rationale": "Initial interview greeting and kickoff.",
            "is_finished": False,
            "drill_down": False
        }

    system_prompt = f"""You are an elite, rigorous technical interviewer assessing a candidate for {state.get('position', 'Software Engineer')} ({state.get('experience_level', 'Mid Level')}).
Evaluate the candidate's latest response against the question asked.

Evaluation Depth Guidelines:
- 'weak_vague': Hand-waving, buzzwords without explanation, missing fundamentals, or incorrect.
- 'satisfactory': Solid, correct answer meeting typical industry expectations.
- 'exceptional': Deep mastery, mentions architectural tradeoffs, internals, or performance implications.
- 'off_topic_or_query': The candidate asked for clarification, evaded, or gave a non-answer.

Provide a 1-sentence rationale and a clarity score (1-10)."""

    structured_evaluator = llm.with_structured_output(AnswerAssessment)
    prompt_history = [SystemMessage(content=system_prompt)]
    for m in messages[-6:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role in ["ai", "assistant"]:
            prompt_history.append(AIMessage(content=content))
        else:
            prompt_history.append(HumanMessage(content=content))

    # Gemini requires at least one user content message
    if not any(isinstance(msg, HumanMessage) for msg in prompt_history):
        prompt_history.append(HumanMessage(content=latest_answer or "Here is my answer to the interview question."))

    try:
        assessment = await structured_evaluator.ainvoke(prompt_history)
        return {
            "evaluation_depth": assessment.evaluation_depth,
            "candidate_clarity": assessment.candidate_clarity,
            "evaluation_rationale": assessment.evaluation_rationale,
            "is_finished": False,
            "drill_down": assessment.evaluation_depth == "weak_vague"
        }
    except Exception as e:
        print(f"Error in assess_answer_node: {e}")
        return {
            "evaluation_depth": "satisfactory",
            "candidate_clarity": 7,
            "evaluation_rationale": "Fallback due to assessment parsing.",
            "is_finished": False,
            "drill_down": False
        }

def route_interview(state: InterviewState) -> str:
    """Deterministic routing based on remaining questions and assessment."""
    if state.get("questions_left", 0) <= 0:
        return "finalize"
    
    depth = state.get("evaluation_depth", "satisfactory")
    if depth == "weak_vague":
        return "drill_down"
    elif depth == "exceptional":
        return "advanced"
    return "standard"

async def drill_down_node(state: InterviewState) -> dict:
    """Drills down into underlying mechanics when answer was surface-level."""
    resume_context = f"\nCandidate Resume Background:\n{state.get('resume')}\n" if state.get("resume") else ""
    system_prompt = f"""You are conducting a rigorous technical interview for {state.get('position')} ({state.get('experience_level')}).
The candidate gave a surface-level or vague answer ({state.get('evaluation_rationale')}).
{resume_context}
INSTRUCTIONS:
1. Do NOT reveal the correct answer.
2. Formulate a targeted, incisive follow-up question probing the exact mechanics, internals, or tradeoffs of what they touched upon.
3. Stay stoic, concise, and professional. No pleasantries or fluff."""

    structured_llm = llm.with_structured_output(QuestionOutput)
    prompt_history = [SystemMessage(content=system_prompt)]
    for m in state.get("messages", [])[-6:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role in ["ai", "assistant"]:
            prompt_history.append(AIMessage(content=content))
        else:
            prompt_history.append(HumanMessage(content=content))

    if not any(isinstance(msg, HumanMessage) for msg in prompt_history):
        latest = state.get("latest_answer") or "Could you ask me a follow-up question?"
        prompt_history.append(HumanMessage(content=latest))

    try:
        res = await structured_llm.ainvoke(prompt_history)
        return {"next_question": res.question, "drill_down": True}
    except Exception as e:
        print(f"Error in drill_down_node: {e}")
        return {"next_question": "Can you elaborate on the underlying mechanics and trade-offs of that approach in high-throughput scenarios?", "drill_down": True}

async def advanced_topic_node(state: InterviewState) -> dict:
    """Escalates technical difficulty after a strong answer."""
    resume_context = f"\nCandidate Resume Background:\n{state.get('resume')}\n" if state.get("resume") else ""
    system_prompt = f"""You are conducting a rigorous technical interview for {state.get('position')} ({state.get('experience_level')}).
The candidate answered with exceptional depth.
{resume_context}
INSTRUCTIONS:
1. Escalate difficulty: Ask an advanced architectural, distributed systems, edge-case, or concurrency challenge.
2. Maintain a stoic, professional demeanor (do NOT flatter or say 'great job').
3. Ask one clear, direct question."""

    structured_llm = llm.with_structured_output(QuestionOutput)
    prompt_history = [SystemMessage(content=system_prompt)]
    for m in state.get("messages", [])[-6:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role in ["ai", "assistant"]:
            prompt_history.append(AIMessage(content=content))
        else:
            prompt_history.append(HumanMessage(content=content))

    if not any(isinstance(msg, HumanMessage) for msg in prompt_history):
        latest = state.get("latest_answer") or "Ready for the next technical challenge."
        prompt_history.append(HumanMessage(content=latest))

    try:
        res = await structured_llm.ainvoke(prompt_history)
        return {"next_question": res.question, "drill_down": False}
    except Exception as e:
        print(f"Error in advanced_topic_node: {e}")
        return {"next_question": "Let's explore concurrency and fault tolerance: how would you handle distributed split-brain scenarios in this design?", "drill_down": False}

async def standard_question_node(state: InterviewState) -> dict:
    """Asks the next progression question across core skills."""
    resume_context = f"\nCandidate Resume Background:\n{state.get('resume')}\n" if state.get("resume") else ""
    system_prompt = f"""You are conducting a rigorous technical interview for {state.get('position', 'Software Engineer')} ({state.get('experience_level', 'Mid Level')}).
Mode: {state.get('interview_mode', 'Guided Mode')}.
{resume_context}
INSTRUCTIONS:
1. Progress to the next core technical competency for this role, referencing specific skills or projects from the candidate's resume when provided.
2. If this is the start of the interview, greet briefly and ask your opening technical question tailored to their resume/background.
3. Keep the question crisp, relevant to real-world engineering, and appropriate for their experience level.
4. No excessive chit-chat; stay professional, stoic, and direct."""

    structured_llm = llm.with_structured_output(QuestionOutput)
    prompt_history = [SystemMessage(content=system_prompt)]
    for m in state.get("messages", [])[-6:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role in ["ai", "assistant"]:
            prompt_history.append(AIMessage(content=content))
        else:
            prompt_history.append(HumanMessage(content=content))

    # Crucial: Ensure at least one HumanMessage is present so Gemini's contents are never empty
    if not any(isinstance(msg, HumanMessage) for msg in prompt_history):
        latest = state.get("latest_answer") or "Let's begin the interview. Please ask your first question."
        prompt_history.append(HumanMessage(content=latest))

    try:
        res = await structured_llm.ainvoke(prompt_history)
        return {"next_question": res.question, "drill_down": False}
    except Exception as e:
        print(f"Error in standard_question_node: {e}")
        pos = state.get("position", "Software Engineer")
        fallback_q = f"Welcome to your interview for {pos}. To start off, could you walk me through a complex technical challenge you recently solved and the architecture decisions you made?"
        return {"next_question": fallback_q, "drill_down": False}

async def finalize_node(state: InterviewState) -> dict:
    """Wraps up the interview when questions are exhausted."""
    return {
        "next_question": "Your interview is over. You can see the detail analysis of this interview in your profile in some time.",
        "is_finished": True,
        "drill_down": False
    }

# ----------------- Explanation Helper -----------------

async def explain_concept(last_question: str) -> str:
    """Provides a clear explanation when candidate submits //explain."""
    system_prompt = """You are an expert technical interviewer and mentor.
Explain the technical concept and core engineering principles behind the question clearly and point-wise.
Conclude your explanation with: 'Type //yes for next question.'"""
    structured_explainer = llm.with_structured_output(ExplanationOutput)
    try:
        res = await structured_explainer.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Please explain this interview question: {last_question}")
        ])
        return res.explanation
    except Exception as e:
        print(f"Error in explain_concept: {e}")
        return f"Explanation for: {last_question}\n\nKey concepts involve analyzing data access patterns, time/space complexity, and architecture trade-offs.\n\nType //yes for next question."

# ----------------- Build & Compile Graph -----------------

def build_interview_graph():
    workflow = StateGraph(InterviewState)
    workflow.add_node("assess_answer", assess_answer_node)
    workflow.add_node("drill_down", drill_down_node)
    workflow.add_node("advanced", advanced_topic_node)
    workflow.add_node("standard", standard_question_node)
    workflow.add_node("finalize", finalize_node)

    workflow.add_edge(START, "assess_answer")
    workflow.add_conditional_edges(
        "assess_answer",
        route_interview,
        {
            "drill_down": "drill_down",
            "advanced": "advanced",
            "standard": "standard",
            "finalize": "finalize"
        }
    )
    workflow.add_edge("drill_down", END)
    workflow.add_edge("advanced", END)
    workflow.add_edge("standard", END)
    workflow.add_edge("finalize", END)

    return workflow.compile()

interview_graph = build_interview_graph()

# ----------------- Post-Interview Comprehensive Evaluation -----------------

async def generate_interview_analysis(resume_text: str, position: str, experience_level: str, messages: List[Dict[str, str]]) -> InterviewAnalysisOutput:
    """Generates an exhaustive, multi-dimensional scorecard and analysis of the entire interview."""
    system_prompt = """You are an expert AI analyst and seasoned technical hiring manager. Your objective is to perform a comprehensive, unbiased analysis of a completed technical job interview and return structured evaluation data.

EVALUATION RUBRIC:
1. Holistic Assessment:
   - interviewName: Give a relevant title (e.g. 'Senior Backend Engineer Interview - Distributed Systems focus')
   - resumeSummary: Extract key skills, technologies, experience, and accomplishments from the resume.
   - overAllRating: Overall performance rating from 0.0 to 10.0.
   - overallTechnicalKnowledge: Holistic score from 0.0 to 10.0 for technical depth and correctness.
   - overallProblemSolving: Holistic score from 0.0 to 10.0 for problem-solving structuring.
   - overallCommunicationClarity: Holistic score from 0.0 to 10.0 for clarity and conciseness.

2. Per-Question Analysis:
   For every question asked by the interviewer:
   - question: The question text.
   - userAnswer: The candidate's response.
   - feedback: Specific, constructive critique highlighting strengths and deficiencies.
   - suggestedAnswer: An ideal, expert-level model answer illustrating best practices.
   - rating: 0-10 rating for this specific answer.
   - technicalKnowledge, problemSolvingSkills, communicationClarity: Dimension scores (0-10)."""

    formatted_transcript = "\n".join([f"{m.get('role', 'speaker').upper()}: {m.get('content', '')}" for m in messages])
    
    user_prompt = f"""Position: {position}
Experience Level: {experience_level}
Candidate Resume Summary: {resume_text[:2000] if resume_text else 'No resume provided'}

Full Dialogue Transcript:
{formatted_transcript}"""

    structured_evaluator = llm.with_structured_output(InterviewAnalysisOutput)
    return await structured_evaluator.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])
