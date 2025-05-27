import { asyncHandler } from "../utils/aysncHandler.js"
import { ApiResponse} from "../utils/ApiResponse.js"
import { ApiError }  from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken  = async(userId)=>{
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong , while creating access and refresh token")
    }
}

const userSignUp = asyncHandler(async(req, res)=>{
    // take input from the user
    // verify all the field is present or not
    // push the data in the db 

    const {username, fullName, email, password, role} = req.body

    if(
        [username, fullName, email, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All field is required")
    }

    const userPresent = await User.findOne({
        $or: [{username}, {email}]
    })

    if (userPresent){
        throw new ApiError(409, "User with email or username already present")
    }

    const newUser = await User.create({
        fullName: fullName,
        username: username,
        email: email, 
        password: password,
        role: role,
    })

    const userCreation = await User.findById(newUser._id)
    .select('-password -refreshToken');

    if(!userCreation){
        throw new ApiError(500, "Something went wrong, while registering the user")
    }

    return res.status(200).json(
        new ApiResponse(201, userCreation, "User registered Successfully")
    )

})

const userLogin = asyncHandler(async(req, res)=>{
    const {username, email, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User already exits")
    }

    const isPasswordCorect = await user.isPasswordCorrect(password)

    if(!isPasswordCorect){
        throw new ApiError(401, "Password is incorrect")
    }

    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id)

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true, 
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse(200, {user: loggedUser, accessToken, refreshToken}, "User loggged in Successfully"))
})

const userLogout  = asyncHandler(async(req, res)=>{
    await User.findById(req.user._id, 
        {
            $unset: {
                refreshToken: 1
            }
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "You are logout"))
})


const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fectehed successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    try {
        const incomingUserToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingUserToken){
            throw new ApiError(401, "Unauthorized Access")
        }

        const decodeToken = jwt.verify(incomingUserToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodeToken?._id);
        if(!user){
            throw new ApiError(401, "Unauthorized Access");
        }

        if(incomingUserToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expred or used");
        }

        const {newRefreshToken, newAccessToken} = await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true, 
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", newAccessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(200, {accessToken: newAccessToken, refreshToken: newRefreshToken}, "Access Token Refreshed")
        )

    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token")
    }
})

const test = asyncHandler(async(req, res)=>{
    try {
        return res.json("ALl good")
    } catch (error) {
        throw new ApiError(401, "Unauthorized access")
    }
})



export {
    userSignUp,
    userLogin,
    userLogout,
    getCurrentUser,
    test
}