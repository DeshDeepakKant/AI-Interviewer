import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import model from "../utils/ai/index.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "../utils/ai/loader.js";
import client from "../utils/reddisClient.js";
import path from 'path';
import aiInterview from "../utils/ai/index.js";
import aiAnalysis from "../utils/ai/aiAnalysis.js";
import { console } from "inspector";
import { UserHistory } from "../models/userHistory.models.js";
import {User} from "../models/user.models.js";
import fs from 'fs';
import { downloadFileWithUniqueName } from "../utils/supabaseStorage.js";

const aiInterviewWay = asyncHandler(async(req, res) => {
    try {
        const {position, experienceLevel, numberOfQuestionYouShouldAsk,resumeUrl, sessionId} = req.body;

        if (!position || !experienceLevel || !numberOfQuestionYouShouldAsk) {
            throw new ApiError(400, "All fields are required");
        }

        // Download the resume file and get its local path
        const { localPath } = await downloadFileWithUniqueName(resumeUrl, 'resumes');
        const docResume = await fileLoading(localPath)
        
        if (!docResume) {
            return res.status(400).json(new ApiResponse(400, "Resume file is empty or not valid"));
        }

        try {
            fs.unlinkSync(localPath); // Clean up the local file after processing
        } catch (error) {
            
        }
        await client.hset(
            sessionId,{
                userId: req.user._id,
                position: position,
                experienceLevel: experienceLevel,
                numberOfQuestionYouShouldAsk: numberOfQuestionYouShouldAsk,
                numberOfQuestionLeft: numberOfQuestionYouShouldAsk,
                count: 0,
                resume: docResume,
                messages: JSON.stringify([]),
            }
        )
        await client.expire(sessionId, 7200); // Set session to expire in 2 hours
        return res.status(200).json(new ApiResponse(200, "AI interview started successfully"));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        return res.status(500).json(new ApiResponse(500, error.message));
    }
});
const aiInterviewStart = asyncHandler(async(req, res)=>{
    try {

        const {sessionId, answer} = req.body
        if (!sessionId) {
            throw new ApiError(400, "Session ID is required");
        }
        const data = await client.hgetall(sessionId)
        let messages = JSON.parse(data.messages)
        messages.push(`Question Number:${data.count}`)
        messages.push(`role: user, content: ${answer}`)
        const ai = await aiInterview(data.resume, data.position,data.numberOfQuestionLeft, data.experienceLevel, data.numberOfQuestionYouShouldAsk, data.messages, answer)
        messages.push(`role: ai, content: ${ai}`)
        const multi = client.multi();
        multi.hincrby(sessionId, 'numberOfQuestionLeft', -1);
        multi.hset(sessionId, 'messages', JSON.stringify(messages));
        multi.hincrby(sessionId, 'count', data.count+1);
        await multi.exec();

        return res.status(200).json(new ApiResponse(200, ai));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error)
        throw new ApiError(500, "Something went wrong")
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
            throw new ApiError(404, "User not found");
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
        throw new ApiError(500, "Something went wrong");
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
        console.error("Error in aiInterview.controller.js:", error)
        throw new ApiError(500, "Something went wrong")
    }
})

export {aiInterviewWay, aiInterviewStart, aiInterviewAnalysis, aiHistory}