import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
dotenv.config({
  path: "./.env",
});
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-interview-r4kaoxqra-surajpatel04s-projects.vercel.app',
  'https://ai-interview-git-main-surajpatel04s-projects.vercel.app',
  'https://ai-interview-seven-chi.vercel.app',
];

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like Postman or curl)
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

// cookie-parser
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import aiInterviewRouter from "./routes/aiInterview.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/ai", aiInterviewRouter)

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

export default app ;
