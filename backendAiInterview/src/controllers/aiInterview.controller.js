import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "../utils/ai/loader.js";
import client from "../utils/reddisClient.js";
import aiInterview from "../utils/ai/index.js";
import aiAnalysis from "../utils/ai/aiAnalysis.js";
import { console } from "inspector";
import { UserHistory } from "../models/userHistory.models.js";
import {User} from "../models/user.models.js";
import fs from 'fs/promises';
import dotenv from "dotenv";
import {v4 as uuidv4} from "uuid"

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

        // 2. Save the data to Redis FIRST
        await client.hset(
            sessionId, {
                userId: req.user._id,
                resume: docResume,
            }
        );
        await client.expire(sessionId, 7200);

        return res.status(200).json(new ApiResponse(200, { sessionId: sessionId }, "File uploaded successfully"));

    } catch (error) {
        console.error("Error in aiResumeFile:", error); // Should log full error
        return res.status(500).json({ 
            error: "An error occurred while processing the file.", 
            details: error.message // Send actual error message to Postman for debugging
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
        const {position, experienceLevel, numberOfQuestionYouShouldAsk, sessionId} = req.body;

        if (!position || !experienceLevel || !numberOfQuestionYouShouldAsk || !sessionId) {
            throw new ApiError(400, "All fields are required");
        }
        
        await client.hset(
            sessionId,{
                position: position,
                experienceLevel: experienceLevel,
                numberOfQuestionYouShouldAsk: numberOfQuestionYouShouldAsk,
                numberOfQuestionLeft: numberOfQuestionYouShouldAsk,
                count: 0,
                messages: JSON.stringify([]),
            }
        )
        return res.status(200).json(new ApiResponse(200, {numberOfQuestion: numberOfQuestionYouShouldAsk}));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
});

const aiInterviewStart = asyncHandler(async(req, res)=>{
    try {
        const { sessionId, answer } = req.body;
        
        if (!sessionId) {
            return res.status(400).json(new ApiResponse(400, null, 'Session ID is required'));
        }
        
        const data = await client.hgetall(sessionId);
        if (!data) {
            return res.status(404).json(new ApiResponse(404, null, 'Session not found'));
        }

        let messages = [];
        try {
            messages = data.messages ? JSON.parse(data.messages) : [];
        } catch (parseError) {
            console.error('Error parsing messages:', parseError);
            messages = [];
        }


        messages.push(`Question Number:${data.count || 1}`);
        messages.push(`role: user, content: ${answer || ''}`);

        const ai = await aiInterview(
            data.resume || '',
            data.position || '',
            data.numberOfQuestionLeft || 0,
            data.experienceLevel || 'beginner',
            data.numberOfQuestionYouShouldAsk || 5,
            messages,
            answer || ''
        );

        messages.push(`role: ai, content: ${ai}`);

        const multi = client.multi();
        multi.hincrby(sessionId, 'numberOfQuestionLeft', -1);
        multi.hset(sessionId, 'messages', JSON.stringify(messages));
        multi.hincrby(sessionId, 'count', 1);

        await multi.exec()


        return res.status(200).json(
            new ApiResponse(200, {
                result: ai
            })
        );
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
})

const aiInterviewAnalysis = asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            throw new ApiError(400, "Session ID is required");
        }

        const data = await client.hgetall(sessionId);
        if(!data){
            throw new ApiError(404, "Session not found");
        }
        const ai = await aiAnalysis(data.resume, data.position, data.experienceLevel, data.messages);
        const { overAllRating, ...questionEntries } = ai;
        const interviewData = {
            history: questionEntries,
            resume: data.resume,
            experienceLevel: data.experienceLevel,
            position: data.position,
            numberOfQuestions: data.numberOfQuestionYouShouldAsk,
            overAllRating: overAllRating
        };

        const user = await User.findById(data.userId);
        if (!user) {
                    console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
        }

        const historyKey = `history ${Date.now()}`; // or use a UUID or other unique key
        const update = {};
        update[`histories.${historyKey}`] = interviewData;

        await UserHistory.findOneAndUpdate(
            { userId: data.userId },
            { $set: update },
            { upsert: true, new: true }
        );

        await client.del(sessionId);

        return res.status(200).json(new ApiResponse(200, "Interview analysis completed successfully"));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
});

const aiHistory = asyncHandler(async(req, res)=>{
    try {
        const userId = await User.findById(req.user._id);
        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }
        const history = await UserHistory.findOne({userId: userId});
        return res.status(200).json(new ApiResponse(200, history));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
})

export {aiInterviewWay, aiInterviewStart, aiInterviewAnalysis, aiHistory, aiResumeFile}