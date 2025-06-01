import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '../../.env' });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Uploads a file to Supabase Storage and returns its public URL
 * @param {string} filePath - Path to the local file to upload
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadToSupabase = async (filePath) => {
  try {
    // Validate input
    if (!filePath) throw new Error('File path is required');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const bucketName = 'aiinterview';
    const fileName = path.basename(filePath);
    
    console.log(`📤 Uploading ${fileName} to Supabase Storage...`);

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'auto'
      });

    if (uploadError) {
      if (uploadError.message.includes('already exists')) {
        console.log('ℹ️ File already exists, using existing file');
      } else {
        throw uploadError;
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log('✅ File uploaded successfully');
    console.log('🌐 Public URL:', publicUrl);
    
    return publicUrl;

  } catch (error) {
    console.error('❌ Error uploading to Supabase:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    throw error;
  }
};

// For testing the function directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path to upload');
    process.exit(1);
  }
  uploadToSupabase(filePath)
    .then(url => console.log('Uploaded to:', url))
    .catch(console.error);
}