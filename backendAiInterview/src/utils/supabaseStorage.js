// supabaseStorage.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

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

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with enhanced error handling
function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
  }

  // Clean up the URL - remove any API paths and trailing slashes
  let formattedUrl = supabaseUrl
    .replace(/\/(storage|rest|auth|graphql)\/v1\/.*$/, '') // Remove API paths
    .replace(/\/+$/, ''); // Remove trailing slashes
  
  console.log('Initializing Supabase client with URL:', formattedUrl);
  
  return createClient(
    formattedUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    }
  );
}

let supabase;
try {
  supabase = createSupabaseClient();
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error.message);
  process.exit(1);
}

/**
 * Uploads a local file to a (public) Supabase Storage bucket and returns its public URL.
 *
 * @param {string} localFilePath   - Absolute path of the file on disk (e.g. "/tmp/tempfile.png")
 * @param {string} bucketName      - Name of your public bucket (e.g. "avatars")
 * @param {string} destinationPath - The path (key) inside the bucket. For public buckets,
 *                                   this will be publicly accessible at:
 *                                   https://<SUPABASE_URL>/storage/v1/object/public/{bucketName}/{destinationPath}
 *
 * @returns {Promise<string>}      - Resolves with the public URL of the uploaded file
 * @throws {Error}                 - If upload fails
 */
export const uploadFileToSupabase = async (
  localFilePath,
  bucketName,
  destinationPath
) => {
  try {
    // Debug: Log the environment variables (without exposing sensitive values)
    console.log('Supabase URL configured:', process.env.SUPABASE_URL ? 'Yes' : 'No');
    console.log('Supabase Anon Key configured:', process.env.SUPABASE_ANON_KEY ? 'Yes' : 'No');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL or Anon Key is not configured in environment variables');
    }
    // 1. Check file exists & is non‐empty
    if (!fs.existsSync(localFilePath) || fs.statSync(localFilePath).size === 0) {
      throw new Error(`Local file is missing or empty: ${localFilePath}`);
    }

    console.log(
      `Uploading "${localFilePath}" → bucket "${bucketName}", path "${destinationPath}"`
    );

    // 2. Read the file as a buffer
    const fileBuffer = fs.readFileSync(localFilePath);
    
    // 3. Get the file extension for content type
    const fileExtension = path.extname(localFilePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    // Set content type based on file extension
    if (fileExtension === '.mp3') {
      contentType = 'audio/mpeg';
    } else if (fileExtension === '.wav') {
      contentType = 'audio/wav';
    } else if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    }

    console.log(`Uploading file with content type: ${contentType}`);
    
    // 4. Clean up the destination path to ensure no directories are created
    // Extract just the filename and remove any path separators
    const cleanDestinationPath = path.basename(destinationPath)
        .replace(/[\\/]/g, '') // Remove any path separators
        .replace(/[^\w\d.-]/g, '_'); // Replace special chars with underscores
        
    console.log(`Cleaned destination path: ${cleanDestinationPath}`);
    
    // Validate the final filename
    if (!cleanDestinationPath) {
        throw new Error('Invalid destination filename after cleanup');
    }

    // 5. Check if the bucket exists and is accessible
    try {
      const { data: bucketInfo, error: bucketCheckError } = await supabase.storage
        .from(bucketName)
        .list();
      
      if (bucketCheckError) {
        if (bucketCheckError.message.includes('not found')) {
          throw new Error(`Bucket '${bucketName}' does not exist. Please create it in the Supabase Dashboard first.`);
        }
        throw bucketCheckError;
      }
    } catch (error) {
      console.error('Error accessing bucket:', error.message);
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        console.error('\nPlease ensure that:');
        console.error('1. The bucket exists in your Supabase Storage');
        console.error('2. The bucket has the correct RLS policies set to allow uploads');
        console.error('3. Your service role key is being used if RLS is enabled');
      }
      throw error;
    }

    // 6. Upload the file with the cleaned path (no directory structure)
    console.log(`Uploading to bucket "${bucketName}", filename: "${cleanDestinationPath}"`);
    
    // First, try to delete the file if it exists (to handle upsert properly)
    try {
        await supabase.storage
            .from(bucketName)
            .remove([cleanDestinationPath]);
    } catch (deleteError) {
        // Ignore if file doesn't exist
        if (!deleteError.message.includes('not found')) {
            console.warn('Warning: Could not delete existing file:', deleteError.message);
        }
    }
    
    // Upload the file
    const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(cleanDestinationPath, fileBuffer, {
            cacheControl: '3600',
            upsert: true,
            contentType: contentType,
            duplex: 'half'
        });

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        console.error('\nPlease create the bucket in Supabase Dashboard first:');
        console.error(`1. Go to Storage > Create a new bucket`);
        console.error(`2. Name it: ${bucketName}`);
        console.error('3. Set it to public if you want public access');
      }
      throw uploadError;
    }

    console.log('Upload succeeded. Data:', JSON.stringify(data, null, 2));

    // 7. Since the bucket is public, construct the public URL
    // Format: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<filename>
    const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, ''); // Remove trailing slash if exists
    const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${cleanDestinationPath}`;
    
    console.log('Public URL:', publicUrl);
    console.log('You can access the file at:', publicUrl);
    
    return publicUrl;
  } catch (err) {
    console.error('Supabase upload failed with error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      response: err.response?.data,
      status: err.status,
      statusCode: err.statusCode
    });
    throw new Error(`uploadFileToSupabase failed: ${err.message}`);
  }
};