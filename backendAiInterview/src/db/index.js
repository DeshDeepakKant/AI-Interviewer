import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_Name}`,
      {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
      }
    );
    console.log(`MongoDB connected`);
    return connectionInstance;
  } catch (error) {
    console.error("MongoDB connection error: ", error.message);
    // Don't exit - allow server to start and retry connection
    // The app can still serve requests, but DB operations will fail gracefully
    console.warn("MongoDB connection failed. Server will start but database operations may fail.");
    console.warn("Please check:");
    console.warn("1. MONGODB_URL is set correctly");
    console.warn("2. MongoDB Atlas IP whitelist includes Render IPs (0.0.0.0/0 for testing)");
    console.warn("3. Database user credentials are correct");
    
    // Retry connection in background
    setTimeout(() => {
      console.log("Retrying MongoDB connection...");
      connectDB().catch(() => {
        console.log("MongoDB retry failed. Will retry again later.");
      });
    }, 10000);
    
    return null;
  }
};

export default connectDB;