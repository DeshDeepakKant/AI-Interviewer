import mongoose from "mongoose";
import { User } from "./user.models.js";

// Define schema for a single Q&A item
const qaItemSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  "Your Answer": { type: String, required: true },
  Feedback: { type: String },
  Rating: { type: String }
}, { _id: false });

// Define schema for one history session
const historyItemSchema = new mongoose.Schema({
  history: {
    type: Map,
    of: qaItemSchema,
    required: true
  },
  resume: { type: String },
  experienceLevel: { type: String },
  position: { type: String },
  numberOfQuestions: { type: String },
  overAllRating: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Update to use Map instead of array
const userHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User.modelName,
    required: true
  },
  histories: {
    type: Map,
    of: historyItemSchema
  }
});

export const UserHistory = mongoose.model("UserHistory", userHistorySchema);
