import express from "express"
import { aiInterviewWay, aiInterviewStart } from "../controllers/aiInterview.controller.js"

const router = express.Router()

router.route("/ai").post(aiInterviewWay)
router.route("/aiStart").post(aiInterviewStart)

export default router