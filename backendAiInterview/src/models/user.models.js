import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        index: true,
    },
    fullName: {
        type: String,
        require: true,
        unique: true,
        index: true,
    },
    avatar: {
        url:      { type: String },
        publicId: { type: String }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        required: true, 
        enum: ["student", "company"]
    }
},{timestamps: true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect  = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_ACCESS_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)

