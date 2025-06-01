/**
 * upload-no-content-type.js
 * 
 * Reads /tmp/speech-1748759749639.mp3 and uploads it to Supabase Storage
 * WITHOUT explicitly setting the contentType.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1) Read Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in your environment.');
  process.exit(1);
}

// 2) Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 3) Define bucket name and local file path
const BUCKET_NAME = 'aiinterview';
const LOCAL_FILE_PATH = '/tmp/speech-1748759749639.mp3';
const fileName = path.basename(LOCAL_FILE_PATH);

// 4) Main async function to perform the upload
async function uploadFileWithoutContentType() {
  try {
    // 4a) Check if the file exists locally
    if (!fs.existsSync(LOCAL_FILE_PATH)) {
      console.error(`Error: File not found at ${LOCAL_FILE_PATH}`);
      process.exit(1);
    }

    // 4b) Read the file into a Buffer
    const fileBuffer = fs.readFileSync(LOCAL_FILE_PATH);

    // 4c) Upload to Supabase Storage WITHOUT contentType
    console.log(`Uploading "${fileName}" to bucket "${BUCKET_NAME}" (no contentType)…`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        // Notice: no `contentType` field here
        cacheControl: '3600', // optional
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('Upload successful:', uploadData);

    // 5) Generate a public URL for the uploaded file
    const { publicURL, error: urlError } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (urlError) {
      throw urlError;
    }

    console.log('\nPublic URL for the uploaded file:\n', publicURL);
    console.log('\nSince we didn’t set a contentType, Supabase will serve this as application/octet-stream by default.');
    console.log('If you want it to serve as audio/mpeg, you can update the metadata later:');
    console.log(`\nconst { data, error } = await supabase
  .storage
  .from('${BUCKET_NAME}')
  .update('${fileName}', null, {
    contentType: 'audio/mpeg'
  });
`);
  } catch (err) {
    console.error('Error during upload:', err.message);
  }
}

// 6) Run the upload
uploadFileWithoutContentType();
