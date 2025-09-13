import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import http from "http"
import fs from "fs"
import {Server} from "socket.io"
import { verifyTokenAndGetUser } from "./middlewares/authSocket.js";

dotenv.config({
  path: "./.env",
});

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

import { aiInterviewStart } from "./controllers/aiInterview.controller.js";

io.use(async (socket, next) => {

    let token = socket.handshake.auth.token;

    if (!token || token === 'cookie-auth') {
        const cookies = socket.handshake.headers.cookie;
        if (cookies) {
            const cookieArray = cookies.split(';');
            for (let cookie of cookieArray) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'accessToken') {
                    token = value;
                    break;
                }
            }
        }
    }

    try {

        const user = await verifyTokenAndGetUser(token);

        socket.user = user;

        next();
    } catch (error) {

        console.error("Socket authentication error:", error.message);
        next(new Error("AuthenticationError"));
    }
});


io.on('connection', (socket) => {

  console.log(`Authenticated user connected: ${socket.user.username} (ID: ${socket.user._id})`);

  socket.on('joinRoom', (data) => {
    const { sessionId } = data;
    socket.join(sessionId);

    console.log(`User ${socket.user.username} joined room: ${sessionId}`);
    socket.emit('joinRoomSuccess', { message: `Successfully joined room ${sessionId}` });
  });

  socket.on('sendAnswer', async (data) => {
    try {
        const { sessionId, answer } = (typeof data === 'string') ? JSON.parse(data) : data;
        
        if (!sessionId || answer === undefined) {
            throw new Error('SessionId and answer are required');
        }
        
        const resultPayload = await aiInterviewStart(sessionId, answer, socket.user._id);
        
        socket.emit('aiInterview', resultPayload);
        if (resultPayload.fileName) {
          const filePath = `./uploads/${resultPayload.fileName}.wav`;
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error cleaning up audio file:", err);
        });
      }
    } catch (error) {
        console.error("Error in sendAnswer:", error);
        socket.emit('aiError', { message: error.message || 'An error occurred.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    
    if(allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
 
app.use(express.json());
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import aiInterviewRouter from "./routes/aiInterview.route.js"

app.use("/api/v1/user", userRouter);
app.use("/api/v1/ai", aiInterviewRouter);

// Global error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    message: message,
    data: error.data || null,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export {server, app, io};