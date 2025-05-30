import express from "express"
import { 
    aiInterviewWay, 
    aiInterviewStart, 
    aiInterviewAnalysis, 
    aiHistory } from "../controllers/aiInterview.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js";
const router = express.Router()

router.route("/ai").post(verifyJWT, aiInterviewWay)
router.route("/aiStart").post(aiInterviewStart)
router.route("/aiAnalysis").post(aiInterviewAnalysis)
router.route("/aiHistory").get(verifyJWT, aiHistory)

export default router