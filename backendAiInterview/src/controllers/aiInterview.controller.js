import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "../utils/ai/loader.js";
import client from "../utils/reddisClient.js";
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import aiInterview from "../utils/ai/index.js";
import aiAnalysis from "../utils/ai/aiAnalysis.js";
import { UserHistory } from "../models/userHistory.models.js";
import { User } from "../models/user.models.js";

const downloadFileFromCloudinary = async (fileUrl, filePath) => {
    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        throw new Error('Failed to download file from Cloudinary');
    }
};

const aiInterviewWay = asyncHandler(async(req, res) => {
    try {
        const { position, experienceLevel, numberOfQuestions, resumeUrl, sessionId } = req.body;

        if (!position || !experienceLevel || !numberOfQuestions || !resumeUrl) {
            throw new ApiError(400, "All fields are required");
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate a unique filename for the downloaded resume
        const fileExtension = path.extname(new URL(resumeUrl).pathname) || '.pdf';
        const fileName = `resume_${Date.now()}_${uuidv4()}${fileExtension}`;
        const resumePath = path.join(uploadsDir, fileName);

        // Download the file from Cloudinary
        await downloadFileFromCloudinary(resumeUrl, resumePath);
        
        // Load the downloaded file
        const docResume = await fileLoading(resumePath);
        
        await client.hset(
            sessionId,{
                userId: req.user._id,
                position: position,
                experienceLevel: experienceLevel,
                numberOfQuestionYyouShouldAsk: numberOfQuestionYyouShouldAsk,
                numberOfQuestionLeft: numberOfQuestionYyouShouldAsk,
                resume: docResume,
                count: 0,
                messages: JSON.stringify([]),
            }
        )
        return res.status(200).json(new ApiResponse(200, "AI interview started successfully"));
    } catch (error) {
        console.error("Error in aiInterview.controller.js:", error);
        throw new ApiError(500, "Something went wrong");
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
        const ai = await aiInterview(data.resume, data.position,data.numberOfQuestionLeft, data.experienceLevel, data.numberOfQuestionYyouShouldAsk, data.messages, answer)
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
            numberOfQuestions: data.numberOfQuestionYyouShouldAsk,
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