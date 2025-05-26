// audiogen.js
import * as dotenv from "dotenv";
import fs from "fs/promises";
import fetch from "node-fetch";
import { traceable } from "langsmith/traceable";

dotenv.config();  

const audioTool= async (content) => {
  const apiKey = process.env.SPEECHIFY_API_KEY;
  if (!apiKey) throw new Error("Set SPEECHIFY_API_KEY in your .env");

  const ssml = `<speak>${content}</speak>`;
  const res  = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: ssml,
      voice_id: "henry",
      audio_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS API error ${res.status}: ${err}`);
  }

  const { audio_data } = await res.json();
  const buf = Buffer.from(audio_data, "base64");
  await fs.writeFile("./speech.mp3", buf);
  console.log("✅ speech.mp3 written!");
};

export const textToSpechTool = traceable(audioTool, {
  name: "audioTool",
  run_type: "tool",
});

export default textToSpechTool