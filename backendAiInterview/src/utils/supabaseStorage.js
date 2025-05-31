// supabaseStorage.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

/**
 * Downloads a file from a public URL to a given outputPath.
 * @param {string} fileUrl - The public URL of the file to download
 * @param {string} outputPath - The absolute local path where the file should be saved
 * @returns {Promise<string>} - Resolves to the path where the file was saved
 */
export const downloadFileFromUrl = async (fileUrl, outputPath) => {
  try {
    // Ensure the parent directory exists
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
        Pragma: 'no-cache',
        Expires: '0',
      },
      timeout: 30000,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // Pipe response stream into the output file
    const writer = createWriteStream(outputPath);
    await pipeline(response.data, writer);

    // Confirm the file is non‐empty
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error('Downloaded file is empty or missing');
    }

    console.log(`File downloaded successfully to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    // If something went wrong, attempt to clean up a partial file
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
 * Downloads a file from a URL with a unique name and returns the local path.
 * Writes into a subfolder of /tmp to ensure it works on Vercel.
 * @param {string} fileUrl - The URL of the file to download
 * @param {string} [directory='temp'] - The subfolder under /tmp to save the file
 * @returns {Promise<{localPath: string, filename: string, publicUrl: string}>}
 */
export const downloadFileWithUniqueName = async (fileUrl, directory = 'temp') => {
  try {
    // Build a writable directory under /tmp
    const baseDir = path.join('/tmp', directory);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Derive file extension from URL (fallback to .bin)
    const fileExtension = path.extname(new URL(fileUrl).pathname) || '.bin';
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const outputPath = path.join(baseDir, uniqueFilename);

    console.log(`Downloading file from ${fileUrl} to ${outputPath}`);

    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
      timeout: 30000,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // Stream into /tmp
    const writer = createWriteStream(outputPath);
    await pipeline(response.data, writer);

    // Verify it exists
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error('Downloaded file is empty or missing');
    }

    console.log(`File downloaded successfully to ${outputPath}`);

    // publicUrl is for your own reference; typically you won't serve directly from /tmp
    return {
      localPath: outputPath,
      filename: uniqueFilename,
      publicUrl: `/tmp/${directory}/${uniqueFilename}`,
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
