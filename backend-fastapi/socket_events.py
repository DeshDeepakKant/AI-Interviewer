import socketio
import json
import uuid
import os
import asyncio
import redis.asyncio as redis
from bson import ObjectId
from email_utils import send_completion_notice
from interview_graph import interview_graph, explain_concept
from redis_store import redis_client
from tts_service import generate_speech_audio

def setup_socket_events(sio: socketio.AsyncServer, app):
    
    @sio.on("joinRoom")
    async def join_room(sid, data):
        session_id = data.get("sessionId")
        await sio.enter_room(sid, session_id)
        await sio.emit("joinRoomSuccess", {"message": f"Successfully joined room {session_id}"}, to=sid)

    @sio.on("sendAnswer")
    async def send_answer(sid, data):
        try:
            if isinstance(data, str):
                data = json.loads(data)
                
            session_id = data.get("sessionId")
            answer = data.get("answer", "")
            
            session_data = await redis_client.hgetall(session_id)
            if not session_data:
                msg = "Session expired or not found. Please restart the interview."
                await sio.emit("aiInterview", {"result": msg, "question": msg}, to=sid)
                return

            session_data = {k.decode('utf-8'): v.decode('utf-8') for k, v in session_data.items()}
            messages = json.loads(session_data.get("messages", "[]"))
            num_left = int(session_data.get("numberOfQuestionLeft", "0"))
            resume_text = session_data.get("resume", "")
            position = session_data.get("position", "Software Engineer")
            experience_level = session_data.get("experienceLevel", "Mid Level")
            interview_mode = session_data.get("interviewMode", "Guided Mode")
            
            lower_answer = answer.lower().strip()

            # Handle //explain command
            if lower_answer.startswith("//explain"):
                last_ai_msg = next((m["content"] for m in reversed(messages) if m.get("role") in ["ai", "assistant"]), None)
                if not last_ai_msg:
                    explanation_text = "There is no previous interview question to explain yet. Please type //yes to receive your first question."
                else:
                    explanation_text = await explain_concept(last_ai_msg)
                
                audio_bytes = await generate_speech_audio(explanation_text)
                await sio.emit("aiInterview", {
                    "result": explanation_text,
                    "question": explanation_text,
                    "drillDown": False,
                    "isFinished": False,
                    "numberOfQuestionLeft": num_left,
                    "audio": audio_bytes if audio_bytes else None
                }, to=sid)
                return

            # Check if answer is a start command or kickoff
            is_command = (
                lower_answer.startswith(("//ask", "//yes", "let's start", "start the interview"))
                or "start the interview" in lower_answer
            )
            if not is_command and answer.strip():
                messages.append({"role": "user", "content": answer})
                
            if num_left <= 0 and not is_command:
                finish_msg = "Your interview is over. You can see the detail analysis of this interview in your profile in some time."
                audio_bytes = await generate_speech_audio(finish_msg)
                await sio.emit("aiInterview", {
                    "result": finish_msg,
                    "question": finish_msg,
                    "isFinished": True,
                    "numberOfQuestionLeft": 0,
                    "audio": audio_bytes if audio_bytes else None
                }, to=sid)
                
                # Send completion notice if it's an employer job
                employer_id = session_data.get("employerId")
                if employer_id:
                    db = app.mongodb
                    try:
                        employer = await db["users"].find_one({"_id": ObjectId(employer_id)})
                        if employer:
                            asyncio.create_task(send_completion_notice(
                                employer["email"],
                                "A Candidate",
                                position
                            ))
                    except Exception as e:
                        print(f"Failed to send employer completion notice: {e}")
                return
                
            # Execute LangGraph StateGraph Workflow with resume context
            graph_input = {
                "position": position,
                "experience_level": experience_level,
                "interview_mode": interview_mode,
                "resume": resume_text,
                "messages": messages,
                "latest_answer": answer,
                "questions_left": num_left,
                "evaluation_depth": "starting" if is_command else "satisfactory",
                "candidate_clarity": 10 if is_command else 7,
                "evaluation_rationale": "",
                "next_question": "",
                "drill_down": False,
                "is_finished": False
            }
            
            graph_output = await interview_graph.ainvoke(graph_input)
            question = graph_output.get("next_question", "")
            is_finished = graph_output.get("is_finished", False)
            is_drill_down = graph_output.get("drill_down", False)
            
            messages.append({"role": "ai", "content": question})
            if not is_command:
                num_left = max(0, num_left - 1)
                
            await redis_client.hset(session_id, mapping={
                "messages": json.dumps(messages),
                "numberOfQuestionLeft": str(num_left)
            })

            # Generate high-fidelity neural speech audio
            audio_bytes = await generate_speech_audio(question)
                
            await sio.emit("aiInterview", {
                "result": question,
                "question": question,
                "drillDown": is_drill_down,
                "isFinished": is_finished,
                "numberOfQuestionLeft": num_left,
                "audio": audio_bytes if audio_bytes else None
            }, to=sid)

        except Exception as e:
            print(f"[Socket Error] Exception in send_answer: {e}")
            fallback_q = f"Could you describe a challenging technical problem you solved recently and the system architecture trade-offs you considered?"
            audio_bytes = await generate_speech_audio(fallback_q)
            await sio.emit("aiInterview", {
                "result": fallback_q,
                "question": fallback_q,
                "drillDown": False,
                "isFinished": False,
                "numberOfQuestionLeft": num_left if 'num_left' in locals() else 3,
                "audio": audio_bytes if audio_bytes else None
            }, to=sid)
