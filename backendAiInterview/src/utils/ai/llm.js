import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { configDotenv } from "dotenv";

configDotenv({ path: "../../../.env" });

const llmFalse = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    maxRetries: 2,
    temperature: 0
});

const llmPro = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    maxRetries: 2,
    temperature: 0
})

export { llmPro, llmFalse };
