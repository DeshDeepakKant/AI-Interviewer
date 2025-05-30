import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import model from "../utils/ai/index.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "../utils/ai/loader.js";
import client from "../utils/reddisClient.js";
import path from 'path';
import aiInterview from "../utils/ai/index.js";


const aiInterviewWay = asyncHandler(async(req, res) => {
    try {
        const {position, experienceLevel, numberOfQuestionYyouShouldAsk, sessionId } = req.body;

        if (!position || !experienceLevel || !numberOfQuestionYyouShouldAsk) {
            throw new ApiError(400, "All fields are required");
        }

        // Use absolute path to the Resume.pdf file in the public/uploads directory
        const resumePath = path.join(process.cwd(), 'public', 'uploads', 'Resume.pdf');
        const docResume = await fileLoading(resumePath)
        
        await client.hset(
            sessionId,{
                position: position,
                experienceLevel: experienceLevel,
                numberOfQuestionYyouShouldAsk: numberOfQuestionYyouShouldAsk,
                numberOfQuestionLeft: numberOfQuestionYyouShouldAsk,
                resume: docResume,
                count: 0,
                messages: JSON.stringify([])
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
        console.log("Data",data)
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
        //  console.error("Error in aiInterview.controller.js:", error)
        console.error("Error in aiInterview.controller.js:", error)
        throw new ApiError(500, "Something went wrong")
    }
})


export {aiInterviewWay, aiInterviewStart}