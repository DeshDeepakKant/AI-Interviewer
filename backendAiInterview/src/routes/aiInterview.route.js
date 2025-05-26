import express from "express"
import { aiInterviewStart } from "../controllers/aiInterview.controller.js"

const router = express.Router()

router.route("/ai").post(aiInterviewStart)

export default router