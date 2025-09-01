import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app, server} from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Error: ", error);
      throw error;
    });
    server.listen(PORT, () => {
      console.log(`Server is running ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MONGO db connection faild !!! ", error);
  });
