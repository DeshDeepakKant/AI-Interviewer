import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { traceable } from "langsmith/traceable";
import dotenv from "dotenv";

dotenv.config();

const chat = async (message) => {

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
  });

  const reply = await llm.invoke(message);
  return reply.content
};

export const tracedChatTool = traceable(chat, {
  name: "chat",
  run_type: "tool",
});

export default tracedChatTool;