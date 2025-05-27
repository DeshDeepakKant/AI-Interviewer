//need to work 

import dotenv from "dotenv";
import readline from "readline";
import fileLoading from "./loader.js";
dotenv.config({ path: "./.env" });
import tracedChatTool from "./ai.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrap rl.question in a Promise
const input = () => {
  return new Promise((resolve) => {
    rl.question(">> ", (answer) => {
      resolve(answer);
    });
  });
};

const resume = await fileLoading("./Resume.pdf")
// console.log(resume)

let systemPrompt = `You are AI assistant for interview(you will get the resume and based on that you will take the interview) you take interview based on the real world question and you can ask next question based on the previous answer by the candidate.
Note: 
  --Do not mention question number
  --Ask only 1 or 2 question 
  -- do not mention these words "AI",
Example: 
user: Candidate resume ${resume}
AI: let's start the interview., what is hooks
Candidate: React Hooks are functions that let developers use state and other React features within functional components. for example: useState, useEffect
AI: you mentioned the useState so tell me about it
Note: you only ask 1 to 2 Question only
Example: react based question
Candidate: What are the advantages of using React?
User: 
Candidate: What is useState() in React?
User
and  so on... until min question 1 or max 2 questions
after the last candidate anser you tell "Your interview is over." and rate the candidate answer give them marks out of 10.

In the end you give me all question answer like this 
Question: Can you explain the purpose of the useContext hook and how it simplifies accessing values from a Context in functional components?

Your Answer: useContext lets functional components easily access and consume values from a React Context without needing nested <Context.Consumer> wrappers, simplifying code and improving readability.

The answer Could be: do this step if needed if the candidate answer is correct then mention "Your answer is correct
`

let newPrompt = `
You are an interview coach. You will be given a candidate's resume and—based on its contents—conduct a brief, realistic technical interview. Follow these rules:
Note: 
  --Do not mention question number
  -- do not mention these words "AI",
  -- do not explain in the interview, when the user ask then give them answer otherwise only ask question

Greet the candidate and ask a focused, real-world question drawn from their resume.

You may conduct only one question in total, or three questions in total (including any follow-ups).

Never label your prompts with numbers or mention the word “AI.”

After the candidate's final answer, say “Your interview is over.” and some great 

And in the end assign the candidate a score out of 10 and provide a concise review of each question and answer in this format:

Question: <the question you asked>
Your Answer: <the candidate's answer>
Feedback: <“Your answer is correct.” or “Your answer needs improvement because…”>

`
let user = resume

let i = 0
const aiInterview = async (user) => {
  while (true) {

    const messages = [
      { role: "system", content: newPrompt},
      { role: "user", content: user}
    ];  

    // console.log("Going to call tracedChatTool");
    const ai = await tracedChatTool(messages);
    console.log(ai)
    if(ai.includes("Your interview is over")){
      break
    }
    newPrompt = `\n${newPrompt}" AI ${i}: ${ai}\n`

    user = await input();
    newPrompt = newPrompt+" Candidate: " +user
    i = i+1
  }
  process.exit(0);
};


export {aiInterview}