import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
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
    app.listen(PORT, () => {
      console.log(`Server is running ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MONGO db connection faild !!! ", error);
  });

/* This is first approch 
import express from "express";
PORT = process.env.PORT || 8000;
async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
    app.on("error", (error) => {
      console.error("Error: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`App is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
};

*/