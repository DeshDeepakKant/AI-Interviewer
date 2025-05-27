import { response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import model from "../utils/ai/index.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "./loader.js";



const aiInterviewStart = asyncHandler(async(req, res)=>{
    try {
        
        const {message} = req.body
        console.log(message)
        const ai = await model(message)
        console.log(ai)
        return res.status(200).json(new ApiResponse(200, ai, "Ai reply"))
    } catch (error) {
        //  console.error("Error in aiInterview.controller.js:", error)
        throw new ApiError(500, "Something went wrong")
    }
})


export {aiInterviewStart}