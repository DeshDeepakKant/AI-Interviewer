import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

/**
 * Downloads a file from a public URL
 * @param {string} fileUrl - The public URL of the file to download
 * @param {string} outputPath - The local path where the file should be saved
 * @returns {Promise<string>} - The path where the file was saved
 */
const downloadFileFromUrl = async (fileUrl, outputPath) => {
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log('Downloading file from URL:', fileUrl);
    
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 30000 // 30 seconds timeout
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // Create a write stream to save the file
    const writer = createWriteStream(outputPath);
    
    // Pipe the response data to the file
    await pipeline(response.data, writer);
    
    // Verify the file was written
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error('Downloaded file is empty or missing');
    }

    console.log(`File downloaded successfully to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    // Clean up if file was partially downloaded
    try {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    console.error('Download error:', error);
    throw new Error(`Download failed: ${error.message}`);
  }
};

/**
 * Downloads a file from a URL with a unique name and returns the local path
 * @param {string} fileUrl - The URL of the file to download
 * @param {string} [directory='temp'] - The directory to save the file in (defaults to 'temp')
 * @returns {Promise<{localPath: string, filename: string}>} - Object containing the local path and filename
 */
const downloadFileWithUniqueName = async (fileUrl, directory = 'temp') => {
  try {
    // Create the directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', directory);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename
    const fileExtension = path.extname(new URL(fileUrl).pathname) || '.bin';
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const outputPath = path.join(uploadDir, uniqueFilename);

    console.log(`Downloading file from ${fileUrl} to ${outputPath}`);
    
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

    const writer = createWriteStream(outputPath);
    await pipeline(response.data, writer);

    console.log(`File downloaded successfully to ${outputPath}`);
    
    return {
      localPath: outputPath,
      filename: uniqueFilename,
      publicUrl: `/${directory}/${uniqueFilename}`
    };
  } catch (error) {
    console.error('Error downloading file with unique name:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

export { downloadFileFromUrl, downloadFileWithUniqueName };
