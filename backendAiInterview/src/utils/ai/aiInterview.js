import {llmFalse} from "./llm.js";
import { z } from "zod";
import client from "../reddisClient.js";

const interviewOutputSchema = z.object({
  question: z.string().describe("The next interview question to ask the candidate."),
});

const explanationOutputSchema = z.object({
  explanation: z.string().describe("A clear and concise explanation of the provided technical concept or question.")
});


const aiInterview = async (
  sessionId,
  resume, 
  position, 
  numberOfQuestionLeft, 
  experienceLevel, 
  previousConversation, 
  user="Let’s start the interview.", 
  interviewMode="Guided Mode") => {

  if (user.startsWith("//explain")) {
    const previousConversationArray = previousConversation || [];
    const lastAI = [...previousConversationArray].reverse().find(m => m.role === "ai" && m.content);

    if (!lastAI) {
      return { question: "There is no previous question to explain.", explanation: null };
    }
    
    if (previousConversationArray.length && previousConversationArray[previousConversationArray.length-1].role === "ai"){
      previousConversationArray.pop();
    }
    await client.hset(sessionId, "messages", JSON.stringify(previousConversationArray));
    
    const explanationSystemPrompt = `You are a helpful technical assistant. Your only job is to provide a clear, concise, and easy-to-understand explanation means (explain the answer of the question) and also give answer point wise for the technical interview question you are given and then add this "type //yes for next question"

    STRICT INSTRUCTIONS:
    1. Directly explain the concept or what the question is asking for.
    2. Do NOT ask a new question.
    3. After your explanation, you MUST end your response with the exact phrase: "type //yes for next question".`;

    const structuredExplainerLlm = llmFalse.withStructuredOutput(explanationOutputSchema);

    const explanationResponse = await structuredExplainerLlm.invoke([
      { role: "system", content: explanationSystemPrompt },
      { role: "user", content: `Please explain this interview question: "${lastAI.content}"` }
    ]);

    return {
      question: lastAI.content, 
      explanation: explanationResponse.explanation
    };
  }


  if (numberOfQuestionLeft <= 0) { 
    const endSystemPromt = `You are a helpful assistant whose only job is to formally end an interview. You will be given the entire interview conversation for context, but you will not comment on it.
    YOUR TASK:
    Provide a polite, standardized closing statement.
    STRICT OUTPUT REQUIREMENTS:
    1.  Your response MUST begin with the exact phrase: "Your interview is over."
    2.  Follow it with a brief, polite closing remark (e.g., "Thank you for your time today.").
    3.  Your response MUST end with the exact phrase: "You can see the detail analysis of this interview in your profile in some time."
    DO NOT:
    - DO NOT provide any analysis, feedback, summary, or score of the interview.
    - DO NOT say anything else. Your response should only contain the three parts listed above.
    Example Output:
    "Your interview is over. Thank you for speaking with me today. You can see the detail analysis of this interview in your profile in some time."`;

    const endResponse = await llmFalse.invoke([
        { role: "system", content: endSystemPromt },
        { role: "user", content: "The interview is over."}
    ]);
    return { question: endResponse.content };
  }

  const systemPrompt = `You are a professional technical interviewer. Your objective is to conduct a realistic, in-depth interview to accurately assess a candidate's skills and experience. You will be professional, focused, and adaptable.

  1. CONTEXT YOU WILL RECEIVE:
  - Position: ${position}
  - Experience Level: ${experienceLevel}
  - Resume: ${resume}
  - Interview Mode: ${interviewMode}
  // --- FIX 3: Properly serialize the conversation history for the AI ---
  - Conversation History: ${JSON.stringify(previousConversation, null, 2)}

  2. YOUR INTERVIEWING METHODOLOGY (HOW TO ASK QUESTIONS):
    Your primary goal is to go beyond surface-level questions. Use the conversation history and the candidate's answers to inform your next question dynamically.
    (Your detailed methodology here is good)

  3. STRICT RULES OF ENGAGEMENT:
    - No Explanations (Unless Requested): Your job is to ask questions, not provide answers. 
    - Maintain Professional Tone: Be direct and focused.
    - No Meta-Commentary: Do not mention question numbers, how many questions are left, or that you are an assistant.
    - Language: Only communicate in English.

  4.INTERVIEW FLOW:
  - Start the interview with your first question, with a greeting, and then in the same response, the question should be directly related to a specific project or skill listed on the resume.
  - After each answer, decide to drill down or ask a new question.
  `;
  
  const structuredLlm = llmFalse.withStructuredOutput(interviewOutputSchema);
  
  const messages = [
    { role: "system", content: systemPrompt},
    { role: "user", content: user }
  ];

  const aiResponse = await structuredLlm.invoke(messages);

  return {
    question: aiResponse.question || null,
  };
};

export default aiInterview;