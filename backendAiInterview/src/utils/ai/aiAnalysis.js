import { tracedChatTool } from "./ai.js";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const aiAnalysis = async (resume, position, experienceLevel, chatHistory) => {

  let systemPrompt = `You are AI assistant for interview Analysis you will get these things["Position", "Experience Level","resume", "whole Interview"]. You do analysis of the interview and provide the analysis of the interview in JSON format:

Example:
Output: {Question 1 :{
{Question: <the question asked in the interview>}
{Your Answer: <the candidate's answer>}
{Feedback: <“Your answer is correct.” or “Your answer needs improvement because…”>}
{Rating: <Rating of this answer given by the candidate out of 10>}
},
Question 2 :{
{Question: <the question asked in the interview>}
{Your Answer: <the candidate's answer>}
{Feedback: <“Your answer is correct.” or “Your answer needs improvement because…”>}
{Rating: <Rating of this answer given by the candidate out of 10>}
},
overAllRating: <Overall rating of the interview out of 10>
}

Note: 
--Do not mention question number
-- do not mention these words "AI",


`
const outputSchema = z.object({
  overAllRating: z.number()
    .int()
    .min(0)
    .max(10)
    .describe("The overall rating for the entire interview, from 0 to 10."),

  // Use z.array() to define an array of objects
  analysis: z.array(
    z.object({
      question: z.string().describe("The question that was asked."),
      userAnswer: z.string().describe("The candidate's full answer to the question."),
      feedback: z.string().describe("Constructive feedback on the candidate's answer."),
      rating: z.number()
        .int()
        .min(0)
        .max(10)
        .describe("A rating for this specific answer, from 0 to 10.")
    })
  ).describe("An array of objects, where each object is an analysis of a single question and answer.")
});

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash", // Using 1.5 Flash as it has great structured output support
  });

  const structuredLlm = llm.withStructuredOutput(outputSchema);

  let userDetails = `Please perform the analysis based on the following information:
    Position: ${position}
    Experience Level: ${experienceLevel}
    Resume: ${resume}
    Whole Interview: ${chatHistory}`
//   After the candidate's final answer, say “Your interview is over.” and some greating And in the end assign the candidate a score out of 10 

  // After provide a concise review of each question and answer in this format: 
  // "Feedback"
  // Question: <the question you asked>
  // Your Answer: <the candidate's answer>
  // Feedback: <“Your answer is correct.” or “Your answer needs improvement because…”>

  // The answer Could be: do this step if needed if the candidate answer is correct then mention "Your answer is correct

    const messages = [
      { role: "system", content: systemPrompt},
      { role: "user", content: userDetails}
    ];  

    // console.log("Going to call tracedChatTool");
    const aiResponse = await structuredLlm.invoke(messages);
    console.log(aiResponse)
    return aiResponse
    
};


export default aiAnalysis;