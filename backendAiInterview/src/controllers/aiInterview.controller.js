import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "../utils/ai/loader.js";
import client from "../utils/reddisClient.js";
import aiInterview from "../utils/ai/aiInterview.js";
import aiAnalysis from "../utils/ai/aiAnalysis.js";
import { HistorySession } from "../models/userHistory.models.js";
import fs from 'fs/promises';
import dotenv from "dotenv";
import {v4 as uuidv4} from "uuid";
import { io } from "../app.js";

dotenv.config({ path: '../../.env' });



const aiResumeFile = asyncHandler(async(req, res) => {
    const resumeFile = req.file;
    if (!resumeFile) {
        return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    try {
        const sessionId = uuidv4();
        
        const docResume = await fileLoading(resumeFile.path);

        if (!docResume) {

            return res.status(400).json(new ApiResponse(400, "Resume file is empty or not valid"));
        }

        await client.hset(
            sessionId, {
                userId: req.user._id,
                resume: docResume,
            }
        );
        await client.expire(sessionId, 7200);

        return res.status(200).json(new ApiResponse(200, { sessionId: sessionId }, "File uploaded successfully"));

    } catch (error) {
        console.error("Error in aiResumeFile:", error);
        return res.status(500).json({ 
            error: "An error occurred while processing the file.", 
            details: error.message
        });
    } finally {
        if (resumeFile) {
            try {
                await fs.unlink(resumeFile.path);
                console.log(`Successfully deleted temporary file: ${resumeFile.path}`);
            } catch (cleanupError) {
                console.error(`Error during file cleanup: ${cleanupError}`);
            }
        }
    }
});

const aiInterviewWay = asyncHandler(async(req, res) => {
    try {
        const {position, experienceLevel, numberOfQuestionYouShouldAsk, sessionId, interviewMode} = req.body;

        if (!position || !experienceLevel || !numberOfQuestionYouShouldAsk || !sessionId) {
            throw new ApiError(400, "All required fields (position, experienceLevel, numberOfQuestionYouShouldAsk, sessionId) are required");
        }
        
        await client.hset(
            sessionId,{
                position: position,
                experienceLevel: experienceLevel,
                numberOfQuestionYouShouldAsk: numberOfQuestionYouShouldAsk,
                numberOfQuestionLeft: numberOfQuestionYouShouldAsk,
                interviewMode: interviewMode || "Guided Mode",
                count: 0,
                messages: JSON.stringify([]),
                aiExplanation: JSON.stringify([])
            }
        )
        return res.status(200).json(new ApiResponse(200, {numberOfQuestion: numberOfQuestionYouShouldAsk}));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
});

const aiInterviewStart = async(sessionId, answer)=>{
    try {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        const data = await client.hgetall(sessionId);
        
        if (!data || Object.keys(data).length === 0) {
            throw new Error(`Session not found for sessionId: ${sessionId}. Make sure to create the session first by calling the resume upload and interview setup endpoints.`);
        }

        let messages;
        try {
            messages = data.messages ? JSON.parse(data.messages) : [];
            if (!Array.isArray(messages)) {
                messages = [];
            }
        } catch (parseError) {
            console.error('Error parsing messages:', parseError);
            messages = [];
        }

        
        
    const lowerCaseAnswer = answer.toLowerCase();
        if (!lowerCaseAnswer.startsWith("//explain") &&  
            !lowerCaseAnswer.startsWith("//ask") && 
            !lowerCaseAnswer.startsWith("start the interview") &&
            !lowerCaseAnswer.startsWith("//yes")) {
            messages.push({ role: "user", content: answer || '' });
        }


        const multi = client.multi();
        const ai = await aiInterview(
            sessionId,
            data.resume || '',
            data.position || '',
            data.numberOfQuestionLeft || 0,
            data.experienceLevel || 'beginner',
            messages,
            answer || '',
            data.interviewMode || 'Guided Mode'
        );

        if (answer.startsWith("//explain")){
            let questionExplain;
            try {
            questionExplain = data.aiExplanation ? JSON.parse(data.aiExplanation) : [];
            } catch (parseError) {
                console.error('Error parsing messages:', parseError);
                questionExplain = [];
            }
            questionExplain.push({question: ai.question, 
                explanation: ai.explanation
            })

            multi.hset(sessionId, 'aiExplanation', JSON.stringify(questionExplain));
        }else{
            if (!ai.question.startsWith("Your interview is over")){
                messages.push({ role: "ai", content: ai.question || '' });
                multi.hset(sessionId, 'messages', JSON.stringify(messages));
            }
        }
        let questionLeft
        if (!answer.startsWith("//explain")){
        questionLeft=data.numberOfQuestionLeft -1
            if (questionLeft <=0){
                questionLeft=0
            }
        multi.hincrby(sessionId, 'numberOfQuestionLeft', -1)};
        multi.hincrby(sessionId, 'count', 1);

        await multi.exec();

        let result;
        if(ai.explanation && ai.question){
            result=ai.explanation
        }else{
            result=ai.question
        }

        const payload = {
            result,
            numberOfQuestionLeft: questionLeft
        }
        return payload; 
    } catch (error) {
        throw error;
    }
}

const aiInterviewAnalysis = asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            throw new ApiError(400, "Session ID is required");
        }

        const data = await client.hgetall(sessionId);
        if (!data || Object.keys(data).length === 0) {
            throw new ApiError(404, "Session not found or is empty.");
        }

        const aiResponse = await aiAnalysis(data.resume, data.position, data.experienceLevel, data.messages);
        
        const qaItemsArray = aiResponse.analysis.map(item => {
            return {
                question: item.question,
                userAnswer: item.userAnswer,
                feedback: item.feedback,
                rating: item.rating || 0,
                suggestedAnswer: item.suggestedAnswer,
                technicalKnowledge: item.technicalKnowledge,
                problemSolvingSkills: item.problemSolvingSkills,
                communicationClarity: item.communicationClarity
            };
        });

        let parsedExplanations = [];
        try {
            if (data.aiExplanation && typeof data.aiExplanation === 'string') {
                parsedExplanations = JSON.parse(data.aiExplanation);
            }
        } catch (parseError) {
            console.error("Failed to parse aiExplanation JSON string:", parseError);
            parsedExplanations = [];
        }

        const validModes = ["Guided Mode", "Hard Mode"];
        const interviewMode = validModes.includes(data.interviewMode) 
            ? data.interviewMode 
            : "Guided Mode"; 

        const newHistoryEntry = {
            interviewName: aiResponse.interviewName,
            userId: data.userId,
            resumeSummary: aiResponse.resumeSummary, 
            experienceLevel: data.experienceLevel,
            position: data.position,
            interviewMode: interviewMode,
            mockType: data.mockType || "Mock Interview",
            numberOfQuestions: qaItemsArray.length,
            overAllRating: aiResponse.overAllRating || 0,
            qaItems: qaItemsArray,
            explanations: parsedExplanations 
        };

        const savedSession = await HistorySession.create(newHistoryEntry);
        if (!savedSession) {
            throw new ApiError(500, "Failed to save the interview session to the database.");
        }

        await client.del(sessionId);

        return res.status(200).json(new ApiResponse(200, savedSession, "Interview analysis completed successfully"));
    } catch (error) {
        console.error("Error in aiInterviewAnalysis controller:", error);
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        return res.status(statusCode).json(new ApiResponse(statusCode, null, error.message));
    }
});

const aiHistory = asyncHandler(async(req, res)=>{
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; //

        const skip = (page - 1) * limit;

        const userId = req.user._id; 
        if (!userId) {
            throw new ApiError(401, "User not authenticated");
        }

        const [history, totalItems] = await Promise.all([
            HistorySession.find({ userId: userId })
                          .sort({ createdAt: -1 })
                          .skip(skip)
                          .limit(limit),
            HistorySession.countDocuments({ userId: userId })
        ]);
        
        const totalPages = Math.ceil(totalItems / limit)
        const responseData = {
            data: history,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        };

        if (totalItems === 0) {
            return res.status(200).json(new ApiResponse(200, responseData, "No history found for this user."));
        }

        return res.status(200).json(new ApiResponse(200, responseData, "History retrieved successfully"));

    } catch (error) {
        console.error("Error in aiHistory controller:", error);
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
})

const testCreateSession = asyncHandler(async(req, res) => {
    try {
        const sessionId = uuidv4();
        
        // Create a test session with dummy data
        await client.hset(
            sessionId, {
                userId: "test-user-id",
                resume: "Test resume content for debugging",
                position: "Software Engineer",
                experienceLevel: "intermediate",
                numberOfQuestionYouShouldAsk: 5,
                numberOfQuestionLeft: 5,
                interviewMode: "Guided Mode",
                count: 0,
                messages: JSON.stringify([]),
                aiExplanation: JSON.stringify([])
            }
        );
        await client.expire(sessionId, 7200);

        return res.status(200).json(new ApiResponse(200, { sessionId: sessionId }, "Test session created successfully"));

    } catch (error) {
        console.error("Error in testCreateSession:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
});

export {aiInterviewWay, aiInterviewStart, aiInterviewAnalysis, aiHistory, aiResumeFile, testCreateSession}