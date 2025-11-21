import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app, server } from "./app.js";
import { spawn } from "child_process";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

function runSetupScript() {
  return new Promise((resolve, reject) => {
    // Skip Piper setup on Render (using Google TTS instead)
    // Only run setup if piper directory doesn't exist and we're not in production
    if (process.env.NODE_ENV === 'production' || process.env.SKIP_PIPER_SETUP === 'true') {
      console.log("Skipping Piper setup (using Google TTS)");
      resolve();
      return;
    }
    
    const check = spawn("bash", ["-c", "[ -d piper ] || ./setupPiper.sh"], {
      stdio: "inherit", 
    });

    check.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        // Don't fail if Piper setup fails - we can use Google TTS
        console.warn("Piper setup failed, continuing with Google TTS");
        resolve();
      }
    });
  });
}

runSetupScript()
  .then(() => {
    // Start server first, then connect to DB
    // This ensures the server binds to port even if DB connection fails
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
    });

    // Connect to DB in background (non-blocking)
    connectDB().catch((error) => {
      console.error("Initial DB connection failed, will retry:", error.message);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error);
    // Only exit if server fails to start, not if DB connection fails
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error("Non-critical startup error, continuing...");
    }
  });
