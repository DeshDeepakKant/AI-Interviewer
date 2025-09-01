import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyTokenAndGetUser = async (token) => {
    if (!token) {
        throw new ApiError(401, "Token not provided");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid token: User not found");
        }
        
        return user; 

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
};