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
    const check = spawn("bash", ["-c", "[ -d piper ] || ./setupPiper.sh"], {
      stdio: "inherit", 
    });

    check.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Setup script exited with code ${code}`));
      }
    });
  });
}

runSetupScript()
  .then(() => connectDB())
  .then(() => {
    app.on("error", (error) => {
      console.error("Error: ", error);
      throw error;
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error);
    process.exit(1);
  });
