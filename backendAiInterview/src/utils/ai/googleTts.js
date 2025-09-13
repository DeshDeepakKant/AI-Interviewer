import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

const ttsClient = new textToSpeech.TextToSpeechClient();

async function generateAudioFile(text, fileName) {
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { 
      languageCode: 'en-US', 
      name: 'en-US-Neural2-D' // or 'en-US-Wavenet-D'
    },
    audioConfig: { audioEncoding: 'MP3' },
  });

  const filePath = path.join('./temp', `${fileName}.mp3`);
  fs.writeFileSync(filePath, response.audioContent);
  return filePath;
}

export { generateAudioFile }
