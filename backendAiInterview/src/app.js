import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);
 
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
export default app ;
