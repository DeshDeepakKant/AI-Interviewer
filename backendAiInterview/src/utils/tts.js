import { spawn } from 'child_process';
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);      // <-- ADD THIS

const projectRoot = path.resolve(__dirname, '../..');
const piperExecutable = path.resolve(projectRoot, 'piper', 'piper');
const modelPath = path.resolve(projectRoot, 'piper', 'en_US-lessac-medium.onnx');
// --------------------

function generateWavFile(text, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Synthesizing text: "${text}"`);
    const args = ['--model', modelPath, '--output_file', outputPath];
    const piperProcess = spawn(piperExecutable, args);
    piperProcess.stdin.write(text);
    piperProcess.stdin.end();
    piperProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully created audio file at: ${outputPath}`);
        resolve();
      } else {
        reject(new Error(`Piper process failed with code ${code}`));
      }
    });
    piperProcess.on('error', (err) => reject(err));
  });
}

async function main() {
  const textToSpeak = `Your package.json `;
  // Save the output in the project root, not in the 'utils' folder.
  const outputPaTh = path.resolve("../../uploads")
  const outputFilePath = path.resolve(outputPaTh, 'output.wav');

  try {
    await generateWavFile(textToSpeak, outputFilePath);
    console.log('TTS generation complete!');
  } catch (error) {
    console.error('An error occurred during TTS generation:', error);
  }
}

main();