// upload.js
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '../../../.env' })

// 1. Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Define a function to upload
async function uploadFile() {
  try {
    // Path to the local file you want to upload
    const filePath = path.resolve('./path/to/your/local/avatar.png')
    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath)

    // Choose the bucket and the destination path (inside the bucket)
    const bucketName = 'avatars'
    // e.g. store as "public/profile_1234.png"
    const supabasePath = `public/${path.basename(filePath)}`

    // Optional: set any upload options, like cache control or upsert
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(supabasePath, fileBuffer, {
        cacheControl: '3600',       // 1 hour
        upsert: false,              // don't overwrite if it already exists
        contentType: 'image/png'    // MIME type
      })

    if (error) {
      throw error
    }

    console.log('✅ File uploaded successfully:')
    console.log(data) 
    // data = { Key: 'public/avatar.png', Bucket: 'avatars', ... }

    // 3. (Optional) Get a public URL for that file
    const { publicURL, error: urlError } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(supabasePath)

    if (urlError) {
      throw urlError
    }

    console.log('📭 Public URL:', publicURL)
  } catch (err) {
    console.error('❌ Upload failed:', err.message)
  }
}

uploadFile()
