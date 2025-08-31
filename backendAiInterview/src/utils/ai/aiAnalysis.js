import {llmPro} from "./llm.js";
import { z } from "zod";


const outputSchema = z.object({
  overAllRating: z.number()
    .int()
    .min(0)
    .max(10)
    .describe("The overall rating for the entire interview, from 0 to 10."),

  resumeSummary: z.string().describe("A concise summary of the candidate's resume."),
  interviewName: z.string().describe("Give the interview name based on the whole conversation"),

  analysis: z.array(
    z.object({
      question: z.string().describe("The question that was asked."),
      userAnswer: z.string().describe("The candidate's full answer to the question."),
      feedback: z.string().describe("Constructive, actionable feedback on the candidate's answer."),
      rating: z.number().int().min(0).max(10).describe("A rating for this specific answer, from 0 to 10."),

      technicalKnowledge: z.number().int().min(0).max(10).describe("Rating for technical accuracy and depth. Null if not applicable."),
      problemSolvingSkills: z.number().int().min(0).max(10).describe("Rating for problem-solving and solution structuring. Null if not applicable."),
      communicationClarity: z.number().int().min(0).max(10).describe("Rating for how clearly the candidate explained their thoughts."),
      suggestedAnswer: z.string().min(10, { message: "Suggested answer must be a meaningful sentence and cannot be empty." }).describe("An ideal, expert-level model answer to the question for learning.")
    })
  ).describe("An array of objects, where each object is an analysis of a single question and answer.")
});
const aiAnalysis = async (resume, position, experienceLevel, chatHistory) => {
  const systemPrompt = `You are an expert AI analyst and seasoned technical hiring manager. Your objective is to perform a comprehensive, unbiased analysis of a job interview and provide structured, actionable feedback in a specific JSON format.

  1. YOUR ANALYSIS FRAMEWORK & TASKS:
  
  A. Overall Analysis:
  - interviewName: Give the interview name based on the whole conversation
  - resumeSummary: Create a concise summary of the candidate's resume. Extract key skills, technologies, years of experience, and quantifiable achievements.
  - overAllRating: After analyzing all questions, provide a final, holistic score for the interview (0-10).
  
  B. Per-Question Analysis:
  For each question-and-answer pair, you MUST return all of the following fields:
  - question: The exact question asked.
  - userAnswer: The candidate's full answer.
  - feedback: Constructive, specific, actionable feedback.
  - suggestedAnswer: An ideal, expert-level model answer to the question for learning. This field is REQUIRED and MUST NOT be null. If the candidate's answer is perfect, briefly state that and add a minor point of improvement.
  - rating: Overall rating for this answer (0-10).
  - technicalKnowledge, problemSolvingSkills, communicationClarity: Sub-scores for these dimensions (0-10).
  
  2. FINAL OUTPUT INSTRUCTIONS:
  Return a single valid JSON object that exactly matches the requested schema. Do not return any extra text. The 'suggestedAnswer' field is a critical requirement for every single analysis object.`;

  const structuredLlm = llmPro.withStructuredOutput(outputSchema);

  const userDetails = `Please perform the analysis based on the following information:
    Position: ${position}
    Experience Level: ${experienceLevel}
    Resume: ${resume}
    Whole Interview: ${chatHistory}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userDetails }
  ];

  const aiResponse = await structuredLlm.invoke(messages);
  return aiResponse;
};

export default aiAnalysis;
