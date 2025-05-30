import { tracedChatTool } from "./ai.js";
const aiInterview = async (resume, position, numberOfQuestionLeft, experienceLevel, numberOfQuestionYyouShouldAsk, previousConversation, user="Let’s start the interview.") => {

  let endSystemPromt = `You are helpful assistant you do ending of interview and assign the candidate a score out of 10. you will get the whole interview conversation
  at the start add this word "Your interview is over." and some greating and in the end assign the candidate a score out of 10. and if you cutting the score then also in short explain why you cut the score`

  let systemPrompt = `You are AI assistant for interview(you will get these things["Position", "Experience Level", and "resume", "Number of Question you should ask"] 
  and based on that you will take the interview. you take interview based on the real world question and you can ask 
  next question based on the previous answer by the candidate. 
  Note: 
    --Do not mention question number
    -- do not mention these words "AI",
    -- do not explain in the interview, when the user ask then give them answer otherwise only ask question

  user: Candidate Information
   Resume: ${resume}
  Position: ${position}
  Experience Level: ${experienceLevel}
  Number of Question you will ask: ${numberOfQuestionYyouShouldAsk}
  Number of Question left: ${numberOfQuestionLeft}
  previous conversation: ${previousConversation}
  Example: 
  user: Candidate Information 
  Resume: "resume"
  Position: "position"
  Experience Level: "experienceLevel"
  Number of Question you should ask: "numberOfQuestionYyouShouldAsk"
  AI: Greet the candidate and ask a focused, real-world question drawn from their resume.
  Candidate: React Hooks are functions that let developers use state and other React features within functional components. for 
  example useState, useEffect
  AI: you mentioned the useState so tell me about it
  Example: react based question
  Candidate: What are the advantages of using React?
  User: 
  Candidate: What is useState() in React?
  User: 
`
let prompt = ""
if (numberOfQuestionLeft == 0) {
    prompt = endSystemPromt
}
else {
    prompt = systemPrompt
}
//   After the candidate's final answer, say “Your interview is over.” and some greating And in the end assign the candidate a score out of 10 

  // After provide a concise review of each question and answer in this format: 
  // "Feedback"
  // Question: <the question you asked>
  // Your Answer: <the candidate's answer>
  // Feedback: <“Your answer is correct.” or “Your answer needs improvement because…”>

  // The answer Could be: do this step if needed if the candidate answer is correct then mention "Your answer is correct

    const messages = [
      { role: "system", content: prompt},
      { role: "user", content: user}
    ];  

    // console.log("Going to call tracedChatTool");
    const ai = await tracedChatTool(messages);
    return ai
    
};


export default aiInterview;