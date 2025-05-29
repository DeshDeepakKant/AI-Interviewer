import mongoose from "mongoose";
import { User } from "./user.models";

const historyItemSchema = new mongoose.Schema(
  {
    message: {
      type: [[{ type: Map, of: String }]],  // nested array of key-value objects
      required: true
    },
    resume: {
      type: String
    },
    experienceLevel: {
      type: String
    },
    position: {
      type: String
    },
    numberOfQuestions: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);


const userHistorySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:  User.modelName,
    },
    sessionId: {
        type: String,
        required: true,
    },
    history: [historyItemSchema]
});

export const UserHistory = mongoose.model("UserHistory", userHistorySchema)