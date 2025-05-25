import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/aysncHandler";

const verifyJWT = asyncHandler(async(req, res)=>{
    try {
            const token = req.cookies?.accessToken || req.header("Auhorization")?.replace("Bearer ","");
        
            if (!token){
                throw new ApiError(401, "Unauthorized request");
            }
        
            const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
            if(!user){
                throw new ApiError(401, "Invalid Access Token")
            }
        
            req.user = user
            next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})