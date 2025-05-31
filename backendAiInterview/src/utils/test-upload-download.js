import { uploadFile, downloadFileFromUrl } from './cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUploadAndDownload() {
  try {
    // Path to a test file (you can change this to any file you want to test with)
    const testFilePath = path.join(__dirname, 'test-file.txt');
    
    // Create a test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'This is a test file for Cloudinary upload/download.');
    }
    
    console.log('Uploading test file...');
    const uploadResult = await uploadFile(testFilePath, {
      folder: 'test-uploads',
      resource_type: 'raw'
    });
    
    console.log('Upload successful! File URL:', uploadResult.secure_url);
    
    // Now try to download it
    const downloadPath = path.join(__dirname, 'downloaded-test-file.txt');
    console.log('Downloading file...');
    await downloadFileFromUrl(uploadResult.secure_url, downloadPath);
    
    console.log('Download successful! File saved to:', downloadPath);
    console.log('File content:', fs.readFileSync(downloadPath, 'utf-8'));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUploadAndDownload();
