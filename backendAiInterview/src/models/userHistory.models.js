import mongoose from "mongoose";

const historySessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    resumeSummary: { type: String },
    experienceLevel: { type: String, index: true },
    position: { type: String, index: true },
    mockType: {
        type: String,
        enum: ["Company Interview", "Mock Interview"],
        default: "Mock Interview",
        index: true
    },
    numberOfQuestions: { type: Number, index: true },
    overAllRating: { type: Number, index: true },
    
    qaItems: [{
        question: { type: String, required: true },
        userAnswer: { type: String, required: true }, 
        feedback: { type: String },
        rating: { type: Number } 
    }]

}, { timestamps: true });

export const HistorySession = mongoose.model("HistorySession", historySessionSchema);