import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Downloads an MP3 file from a public Supabase URL
 * @param {string} fileUrl - The public URL of the MP3 file in Supabase Storage
 * @param {string} [outputDir='downloads'] - Directory to save the downloaded file (default: 'downloads')
 * @returns {Promise<string>} - Path to the downloaded file
 */
const downloadMp3FromSupabase = async (fileUrl, outputDir = 'downloads') => {
  try {
    // Create output directory if it doesn't exist
    const outputPath = path.join(process.cwd(), outputDir);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Extract filename from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    let filename = pathParts[pathParts.length - 1];
    
    // Ensure the filename ends with .mp3
    if (!filename.toLowerCase().endsWith('.mp3')) {
      if (filename.includes('.')) {
        // If it has an extension but not .mp3, replace it
        const ext = path.extname(filename);
        filename = filename.replace(ext, '.mp3');
      } else {
        // If no extension, add .mp3
        filename = `${filename}.mp3`;
      }
    }

    const filePath = path.join(outputPath, filename);

    console.log(`Downloading MP3 from: ${fileUrl}`);
    console.log(`Saving to: ${filePath}`);

    // Download the file
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'audio/mpeg',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Create a write stream
    const writer = fs.createWriteStream(filePath);
    
    // Pipe the response data to the file
    response.data.pipe(writer);

    // Return a promise that resolves when the download is complete
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('✅ Download completed successfully');
        resolve(filePath);
      });
      writer.on('error', (error) => {
        console.error('Error writing file:', error);
        reject(new Error(`Failed to save file: ${error.message}`));
      });
    });
  } catch (error) {
    console.error('Error downloading MP3:', {
      message: error.message,
      url: fileUrl,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    throw new Error(`Failed to download MP3: ${error.message}`);
  }
};

// Example usage
// Uncomment and modify the URL to test
/*
const testDownload = async () => {
  try {
    const fileUrl = 'https://your-project-ref.supabase.co/storage/v1/object/public/your-bucket/your-audio-file.mp3';
    const savedPath = await downloadMp3FromSupabase(fileUrl);
    console.log('File saved to:', savedPath);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testDownload();
*/

export default downloadMp3FromSupabase;
