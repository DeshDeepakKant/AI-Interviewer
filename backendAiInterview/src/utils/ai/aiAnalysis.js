import { tracedChatTool } from "./ai.js";
const aiAnalysis = async (resume, position, experienceLevel, chatHistory, user="Do the analysis of the interview") => {

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

let userDetails = `${user}
User Details
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
    const aiResponse = await tracedChatTool(messages);
    

    try {
      // Check if response is wrapped in markdown code block
      const jsonMatch = aiResponse.match(/```(?:json)?\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      
      // Parse the JSON string
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return aiResponse;
    }
    
};


export default aiAnalysis;