import {v2 as cloudinary} from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: 'dgcazfyhi',
  api_key: '662827654551476',    // Replace with your real API key
  api_secret: 'oL8Ns-8I7IFpJLQ6E7PzuLn_uEM' // Replace with your real API secret
});

async function downloadCloudinaryFile(originalUrl, downloadPath) {
  try {
    // Extract public ID from URL
    const urlParts = originalUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0]; // Remove extension
    
    console.log('Public ID:', publicId);
    
    // Generate proper download URL with attachment flag
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      flags: 'attachment' // This forces download instead of inline display
    });
    
    console.log('Generated Download URL:', downloadUrl);
    
    // Now actually download the file
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
      timeout: 30000
    });

    // Ensure directory exists
    const dir = path.dirname(downloadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create write stream and download
    const writer = fs.createWriteStream(downloadPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`File downloaded successfully to: ${downloadPath}`);
        resolve(downloadPath);
      });
      
      writer.on('error', (err) => {
        console.error('Write error:', err);
        fs.unlink(downloadPath, () => {}); // Clean up partial file
        reject(err);
      });
    });

  } catch (error) {
    console.error('Download failed:', error.message);
    
    // If still getting 401, try signed URL approach
    if (error.response && error.response.status === 401) {
      console.log('Trying with signed URL...');
      return downloadWithSignedUrl(originalUrl, downloadPath);
    }
    
    throw error;
  }
}

// Alternative method using signed URLs for private files
async function downloadWithSignedUrl(originalUrl, downloadPath) {
  try {
    const urlParts = originalUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];
    
    // Generate signed URL (for private resources)
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    });
    
    console.log('Using signed URL:', signedUrl);
    
    const response = await axios({
      method: 'GET',
      url: signedUrl,
      responseType: 'stream',
      timeout: 30000
    });

    const dir = path.dirname(downloadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(downloadPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`File downloaded successfully to: ${downloadPath}`);
        resolve(downloadPath);
      });
      
      writer.on('error', (err) => {
        console.error('Write error:', err);
        fs.unlink(downloadPath, () => {});
        reject(err);
      });
    });

  } catch (error) {
    console.error('Signed URL download failed:', error.message);
    throw error;
  }
}

// Usage example
async function main() {
  const originalUrl = 'https://res.cloudinary.com/dgcazfyhi/raw/upload/v1748685895/x9xwotfmv9fvrll9qj9q.pdf';
  const downloadPath = './downloads/downloaded_file.pdf';
  
  try {
    await downloadCloudinaryFile(originalUrl, downloadPath);
    console.log('Download completed!');
  } catch (error) {
    console.error('Failed to download file:', error.message);
  }
}

// Run the download
main();