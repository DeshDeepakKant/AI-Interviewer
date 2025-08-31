import mongoose from "mongoose";

const historySessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    interviewName: {type: String},
    interviewMode: {
        type: String,
        enum: ["Guided Mode", "Hard Mode"],
        default: "Medium Mode",
        index: true
    },
    mockInterViewName: {type: String},
    resumeSummary: { type: String },
    experienceLevel: { type: String, index: true },
    position: { type: String, index: true },
    mockType: {
        type: String,
        enum: ["Company Interview", "Mock Interview"],
        default: "Mock Interview",
        index: true
    },
    explanations: [{
        question: String,
        explanation: String
    }],
    numberOfQuestions: { type: Number, index: true },
    overAllRating: { type: Number },
    overallTechnicalKnowledge: { type: Number },
    overallProblemSolving: { type: Number }, 
    overallCommunicationClarity: { type: Number },
    qaItems: [{
        question: { type: String, required: true },
        userAnswer: { type: String, required: true },
        feedback: { type: String },
        rating: { type: Number },
        suggestedAnswer: { type: String, default: null },
        technicalKnowledge: { type: Number },
        problemSolvingSkills: { type: Number },
        communicationClarity: { type: Number },
    }]

}, { timestamps: true });

export const HistorySession = mongoose.model("HistorySession", historySessionSchema);