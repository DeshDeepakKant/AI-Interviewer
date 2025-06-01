// src/controllers/aiInterview.controller.js

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import fileLoading from "../utils/ai/loader.js";
import getRedisClient from "../utils/redisClient.js"; // ← make sure this returns a client that uses process.env.REDIS_URL
import aiInterview from "../utils/ai/index.js";
import aiAnalysis from "../utils/ai/aiAnalysis.js";
import { UserHistory } from "../models/userHistory.models.js";
import { User } from "../models/user.models.js";
import fs from "fs";
import { downloadFileWithUniqueName } from "../utils/supabaseStorage.js";

const client = getRedisClient();

/**
 * 1) Starts an AI‐driven interview session by downloading the candidate's resume,
 *    loading it, and storing session state in Redis.
 */
const aiInterviewWay = asyncHandler(async (req, res) => {
  try {
    console.log("→ [aiInterviewWay] req.body:", req.body);
    console.log("→ [aiInterviewWay] req.user:", req.user);

    const { position, experienceLevel, numberOfQuestionYouShouldAsk, resumeUrl, sessionId } = req.body;

    if (!position || !experienceLevel || !numberOfQuestionYouShouldAsk) {
      console.warn("→ [aiInterviewWay] Missing required fields");
      return res.status(400).json(new ApiResponse(400, "All fields are required"));
    }

    // 1.a) Download the resume file
    console.log(`→ [aiInterviewWay] Downloading resume from: ${resumeUrl}`);
    let localPath;
    try {
      ({ localPath } = await downloadFileWithUniqueName(resumeUrl, "resumes"));
    } catch (downloadError) {
      console.error("→ [aiInterviewWay] downloadFileWithUniqueName ERROR:", downloadError);
      return res.status(500).json(new ApiResponse(500, `Download failed: ${downloadError.message}`));
    }
    console.log("→ [aiInterviewWay] Resumé downloaded to:", localPath);

    // 1.b) Process the downloaded PDF/TXT
    let docResume;
    try {
      docResume = await fileLoading(localPath);
    } catch (loadErr) {
      console.error("→ [aiInterviewWay] fileLoading ERROR:", loadErr);
      // Clean up the temp file before returning
      try { fs.unlinkSync(localPath); } catch (_) {}
      return res.status(500).json(new ApiResponse(500, `Failed to parse resume: ${loadErr.message}`));
    }

    if (!docResume) {
      console.warn("→ [aiInterviewWay] fileLoading returned empty docResume");
      // Clean up
      try { fs.unlinkSync(localPath); } catch (_) {}
      return res.status(400).json(new ApiResponse(400, "Resume file is empty or not valid"));
    }

    // 1.c) Delete the temp file (we already have docResume in memory)
    try {
      fs.unlinkSync(localPath);
      console.log("→ [aiInterviewWay] Deleted temp file:", localPath);
    } catch (unlinkErr) {
      console.warn("→ [aiInterviewWay] Could not delete temp file:", unlinkErr);
    }

    // 1.d) Store initial session data in Redis
    try {
      await client.hSet(sessionId, {
        userId: req.user?._id || "UNKNOWN_USER",
        position,
        experienceLevel,
        numberOfQuestionYouShouldAsk,
        numberOfQuestionLeft: numberOfQuestionYouShouldAsk,
        count: 0,
        resume: docResume,
        messages: JSON.stringify([]),
      });
      await client.expire(sessionId, 7200); // Two hours
      console.log("→ [aiInterviewWay] Stored session in Redis for sessionId:", sessionId);
    } catch (redisErr) {
      console.error("→ [aiInterviewWay] Redis HSET/HExpire ERROR:", redisErr);
      return res.status(500).json(new ApiResponse(500, `Redis error: ${redisErr.message}`));
    }

    // 1.e) Success response
    return res.status(200).json(new ApiResponse(200, "AI interview started successfully"));
  } catch (err) {
    console.error("→ [aiInterviewWay] UNCAUGHT ERROR:", err);
    return res.status(500).json(new ApiResponse(500, `Unexpected error: ${err.message}`));
  }
});

/**
 * 2) Receives the user's answer to the current question, invokes the AI to get the next question,
 *    then updates the Redis session state accordingly.
 */
const aiInterviewStart = asyncHandler(async (req, res) => {
  try {
    console.log("→ [aiInterviewStart] req.body:", req.body);

    const { sessionId, answer } = req.body;
    if (!sessionId) {
      console.warn("→ [aiInterviewStart] Missing sessionId");
      return res.status(400).json(new ApiResponse(400, "Session ID is required"));
    }

    // 2.a) Fetch stored session data from Redis
    let data;
    try {
      data = await client.hGetAll(sessionId);
      console.log("→ [aiInterviewStart] Redis returned for sessionId:", sessionId, data);
    } catch (redisErr) {
      console.error("→ [aiInterviewStart] Redis HGETALL ERROR:", redisErr);
      return res.status(500).json(new ApiResponse(500, `Redis error: ${redisErr.message}`));
    }

    // 2.b) If Redis returned {} (empty object) or no messages key
    if (!data || Object.keys(data).length === 0) {
      console.warn("→ [aiInterviewStart] No session found in Redis for sessionId:", sessionId);
      return res.status(404).json(new ApiResponse(404, "Session not found"));
    }

    // 2.c) Parse the stored messages array (if it exists)
    let messages;
    try {
      messages = data.messages ? JSON.parse(data.messages) : [];
    } catch (parseErr) {
      console.error("→ [aiInterviewStart] JSON.parse(data.messages) ERROR:", parseErr);
      return res.status(500).json(new ApiResponse(500, `Malformed messages in session: ${parseErr.message}`));
    }

    // 2.d) Push the user’s answer, invoke AI, and build updated messages
    messages.push(`Question Number: ${data.count}`);
    messages.push(`role: user, content: ${answer}`);

    let ai;
    try {
      ai = await aiInterview(
        data.resume,
        data.position,
        parseInt(data.numberOfQuestionLeft, 10),
        data.experienceLevel,
        parseInt(data.numberOfQuestionYouShouldAsk, 10),
        messages.join("\n"), // or however aiInterview expects the history
        answer
      );
      console.log("→ [aiInterviewStart] aiInterview returned:", ai);
    } catch (aiErr) {
      console.error("→ [aiInterviewStart] aiInterview ERROR:", aiErr);
      return res.status(500).json(new ApiResponse(500, `AI generation failed: ${aiErr.message}`));
    }

    messages.push(`role: ai, content: ${ai}`);

    // 2.e) Update Redis with new count, new messages, new numberOfQuestionLeft
    try {
      const multi = client.multi();
      multi.hIncrBy(sessionId, "numberOfQuestionLeft", -1);
      multi.hSet(sessionId, "messages", JSON.stringify(messages));
      multi.hIncrBy(sessionId, "count", parseInt(data.count, 10) + 1);
      await multi.exec();
      console.log("→ [aiInterviewStart] Redis multi.exec() succeeded");
    } catch (redisErr) {
      console.error("→ [aiInterviewStart] Redis multi ERROR:", redisErr);
      return res.status(500).json(new ApiResponse(500, `Redis update failed: ${redisErr.message}`));
    }

    // 2.f) Return the AI’s reply
    return res.status(200).json(new ApiResponse(200, ai));
  } catch (err) {
    console.error("→ [aiInterviewStart] UNCAUGHT ERROR:", err);
    return res.status(500).json(new ApiResponse(500, `Unexpected error: ${err.message}`));
  }
});

/**
 * 3) When the interview is over, run analysis on all questions/answers,
 *    persist to Mongo, then delete the Redis session.
 */
const aiInterviewAnalysis = asyncHandler(async (req, res) => {
  try {
    console.log("→ [aiInterviewAnalysis] req.body:", req.body);

    const { sessionId } = req.body;
    if (!sessionId) {
      console.warn("→ [aiInterviewAnalysis] Missing sessionId");
      return res.status(400).json(new ApiResponse(400, "Session ID is required"));
    }

    // 3.a) Fetch session data
    let data;
    try {
      data = await client.hGetAll(sessionId);
      console.log("→ [aiInterviewAnalysis] Redis returned:", data);
    } catch (redisErr) {
      console.error("→ [aiInterviewAnalysis] Redis HGETALL ERROR:", redisErr);
      return res.status(500).json(new ApiResponse(500, `Redis error: ${redisErr.message}`));
    }

    if (!data || Object.keys(data).length === 0) {
      console.warn("→ [aiInterviewAnalysis] No session found for sessionId:", sessionId);
      return res.status(404).json(new ApiResponse(404, "Session not found"));
    }

    // 3.b) Parse messages
    let messages;
    try {
      messages = data.messages ? JSON.parse(data.messages) : [];
    } catch (parseErr) {
      console.error("→ [aiInterviewAnalysis] JSON.parse(data.messages) ERROR:", parseErr);
      return res.status(500).json(new ApiResponse(500, `Malformed messages in session: ${parseErr.message}`));
    }

    // 3.c) Invoke AI for analysis
    let aiResult;
    try {
      aiResult = await aiAnalysis(data.resume, data.position, data.experienceLevel, messages);
      console.log("→ [aiInterviewAnalysis] aiAnalysis returned:", aiResult);
    } catch (aiErr) {
      console.error("→ [aiInterviewAnalysis] aiAnalysis ERROR:", aiErr);
      return res.status(500).json(new ApiResponse(500, `AI analysis failed: ${aiErr.message}`));
    }

    // 3.d) Build interviewData and persist to Mongo
    const { overAllRating, ...questionEntries } = aiResult;
    const interviewData = {
      history: questionEntries,
      resume: data.resume,
      experienceLevel: data.experienceLevel,
      position: data.position,
      numberOfQuestions: parseInt(data.numberOfQuestionYouShouldAsk, 10),
      overAllRating,
    };

    let user;
    try {
      user = await User.findById(data.userId);
      console.log("→ [aiInterviewAnalysis] Found user:", user?._id);
    } catch (mongoErr) {
      console.error("→ [aiInterviewAnalysis] Mongo User.findById ERROR:", mongoErr);
      return res.status(500).json(new ApiResponse(500, `Database error: ${mongoErr.message}`));
    }

    if (!user) {
      console.warn("→ [aiInterviewAnalysis] User not found for ID:", data.userId);
      return res.status(404).json(new ApiResponse(404, "User not found"));
    }

    const historyKey = `history ${Date.now()}`; // Or use a UUID
    const update = { $set: { [`histories.${historyKey}`]: interviewData } };

    try {
      await UserHistory.findOneAndUpdate(
        { userId: data.userId },
        update,
        { upsert: true, new: true }
      );
      console.log("→ [aiInterviewAnalysis] UserHistory updated for user:", data.userId);
    } catch (mongoErr) {
      console.error("→ [aiInterviewAnalysis] Mongo UserHistory ERROR:", mongoErr);
      return res.status(500).json(new ApiResponse(500, `Database error: ${mongoErr.message}`));
    }

    // 3.e) Delete Redis session
    try {
      await client.del(sessionId);
      console.log("→ [aiInterviewAnalysis] Deleted Redis key:", sessionId);
    } catch (redisErr) {
      console.error("→ [aiInterviewAnalysis] Redis DEL ERROR:", redisErr);
      // proceed anyway—analysis succeeded
    }

    // 3.f) Return success
    return res
      .status(200)
      .json(new ApiResponse(200, "Interview analysis completed successfully"));
  } catch (err) {
    console.error("→ [aiInterviewAnalysis] UNCAUGHT ERROR:", err);
    return res.status(500).json(new ApiResponse(500, `Unexpected error: ${err.message}`));
  }
});

/**
 * 4) Fetch the logged‐in user’s history from Mongo.
 */
const aiHistory = asyncHandler(async (req, res) => {
  try {
    console.log("→ [aiHistory] req.user:", req.user);

    if (!req.user?._id) {
      console.warn("→ [aiHistory] Missing req.user._id");
      return res.status(401).json(new ApiResponse(401, "Not authenticated"));
    }

    const history = await UserHistory.findOne({ userId: req.user._id });
    console.log("→ [aiHistory] Found history:", history);

    return res.status(200).json(new ApiResponse(200, history || {}));
  } catch (err) {
    console.error("→ [aiHistory] UNCAUGHT ERROR:", err);
    return res.status(500).json(new ApiResponse(500, `Unexpected error: ${err.message}`));
  }
});

export { aiInterviewWay, aiInterviewStart, aiInterviewAnalysis, aiHistory };

