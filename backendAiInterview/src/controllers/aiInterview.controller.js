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
import textToSpechTool from "../utils/ai/audio.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { uploadToSupabase } from '../utils/supabaseFileUpload.js';

dotenv.config({ path: '../../.env' });





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
        const { sessionId, answer } = req.body;
        
        if (!sessionId) {
            return res.status(400).json(new ApiResponse(400, null, 'Session ID is required'));
        }
        
        // Get session data from Redis
        const data = await client.hgetall(sessionId);
        if (!data) {
            return res.status(404).json(new ApiResponse(404, null, 'Session not found'));
        }

        // Parse messages safely
        let messages = [];
        try {
            messages = data.messages ? JSON.parse(data.messages) : [];
        } catch (parseError) {
            console.error('Error parsing messages:', parseError);
            messages = [];
        }

        // Add user message
        messages.push(`Question Number:${data.count || 1}`);
        messages.push(`role: user, content: ${answer || ''}`);

        // Call AI interview
        const ai = await aiInterview(
            data.resume || '',
            data.position || '',
            data.numberOfQuestionLeft || 0,
            data.experienceLevel || 'beginner',
            data.numberOfQuestionYouShouldAsk || 5,
            messages,
            answer || ''
        );
        let audioPath;
// Generate audio file and get its local path
console.log('1. Starting textToSpechTool with ai:', ai ? 'ai is defined' : 'ai is undefined');
try {
    console.log('2. About to call textToSpechTool');
    audioPath = await textToSpechTool(ai);
    console.log('3. Audio path from textToSpechTool:', audioPath);
} catch (error) {
    console.error('4. Error in textToSpechTool:', {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
}   
let publicUrl;
        try {
          publicUrl = await uploadToSupabase(audioPath);
          console.log('File is available at:', publicUrl);
        } catch (error) {
          console.error('Upload failed:', error.message);
        }
        // Add AI response
        messages.push(`role: ai, content: ${ai}`);

        // Update session data
        const multi = client.multi();
        multi.hincrby(sessionId, 'numberOfQuestionLeft', -1);
        multi.hset(sessionId, 'messages', JSON.stringify(messages));
        multi.hincrby(sessionId, 'count', 1);
        
        fs.unlinkSync(audioPath);
        await multi.exec();

        return res.status(200).json(
            new ApiResponse(200, {
                result: ai,
                audioUrl: publicUrl // Return the uploaded audio URL or empty string if upload failed
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

export {aiInterviewWay, aiInterviewStart, aiInterviewAnalysis, aiHistory}
