// import fileLoading from "./loader.js";

import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

import tracedChatTool from "./ai.js";
import textToSpechTool from "./audoi.js";
// fileLoading("./Resume.pdf")

const model = async(work) =>{
  console.log(work)
  const messages = [{"role":"system","content":"You are AI assitant"},
    {"role":"user","content":work}
]
await tracedChatTool(messages);
}

export default model
