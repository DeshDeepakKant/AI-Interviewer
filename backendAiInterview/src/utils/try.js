import { uploadToSupabase } from '../utils/supabaseFileUpload.js';

// Inside your async function:
try {
  const publicUrl = await uploadToSupabase('/tmp/speech-1748761308267.mp3');
  console.log('File is available at:', publicUrl);
} catch (error) {
  console.error('Upload failed:', error.message);
}