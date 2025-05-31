/**
 * downloadCloudinaryFile.js
 *
 * This Node.js script downloads a Cloudinary file (public or private/raw) given its public_id.
 * If the asset is private or requires a signed URL, the script will first generate a signed
 * delivery URL using your Cloudinary credentials, then download and save it locally.
 *
 * Usage (ESM + Node 18+):
 *   1. Save this file as downloadCloudinaryFile.js.
 *   2. Install dependencies: `npm install cloudinary`
 *   3. Ensure your package.json has `"type": "module"`.
 *   4. In the terminal, run:
 *        node downloadCloudinaryFile.js <public_id> [resource_type] [output_filename]
 *
 *    - <public_id>       : The Cloudinary public_id (e.g. "x9xwotfmv9fvrll9qj9q").
 *    - [resource_type]   : Optional; defaults to "raw". Use "image", "video", etc. if needed.
 *    - [output_filename] : Optional; if omitted, derived from public_id + extension.
 *
 * Example:
 *   node downloadCloudinaryFile.js \
 *     x9xwotfmv9fvrll9qj9q \
 *     raw \
 *     myDownloadedReport.pdf
 *
 * Requirements:
 *   - You must have these environment variables set (or replace with literals below):
 *       CLOUDINARY_CLOUD_NAME
 *       CLOUDINARY_API_KEY
 *       CLOUDINARY_API_SECRET
 *   - Node >= 18 (so global fetch() is available). If on older Node, install node-fetch
 *     and uncomment the import at the top.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
// If using Node <18, uncomment and install node-fetch:
// import fetch from "node-fetch";

// 1. Configure Cloudinary credentials from environment (or hard-code here if absolutely necessary)
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "Error: Cloudinary credentials not found. \n" +
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET as environment variables."
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generates a signed URL for a given public_id, resource_type, and format.
 *
 * @param {string} publicId       - The Cloudinary public_id (no extension).
 * @param {string} resourceType   - One of "raw", "image", "video", etc.
 * @param {string} format         - File extension/format (e.g., "pdf", "png").
 * @returns {string}              - A signed, time-limited delivery URL.
 */
function generateSignedUrl(publicId, resourceType = "raw", format = "pdf") {
  // The `sign_url` option instructs Cloudinary to produce a URL with the correct signature
  // The “type” is usually “upload” unless you used a folder or named transformation.
  // In our case, we assume “upload” for simplicity.
  const deliveryOptions = {
    resource_type: resourceType,
    type: "upload",
    sign_url: true,
    // You can optionally set `expiresAt` as a UNIX timestamp to limit how long the URL is valid:
    // expires_at: Math.floor(Date.now() / 1000) + 300, // valid for 5 minutes
  };
  // Cloudinary expects publicId + "." + format when generating the final URL
  return cloudinary.url(`${publicId}.${format}`, deliveryOptions);
}

/**
 * Downloads a file from the given URL and saves it to disk.
 *
 * @param {string} fileUrl        - The full (possibly signed) URL to fetch.
 * @param {string} outputFilename - Path/filename to save the downloaded file.
 */
async function fetchAndSave(fileUrl, outputFilename) {
  try {
    // 1. Make HTTP GET request
    const response = await fetch(fileUrl, {
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    // 2. Determine local filename if not provided
    if (!outputFilename) {
      // Derive from URL’s pathname (last segment)
      const parsedUrl = new URL(fileUrl);
      const pathname = parsedUrl.pathname; // e.g. "/dgcazfyhi/raw/upload/s–SIGNATURE/v1748685895/x9xwotfmv9fvrll9qj9q.pdf"
      outputFilename = path.basename(pathname);
      if (!outputFilename) outputFilename = "downloaded_file";
    }

    // 3. Create write stream
    const writeStream = fs.createWriteStream(outputFilename);

    // 4. Pipe response.body (a ReadableStream<Uint8Array>) into the write stream
    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writeStream.write(Buffer.from(value));
      }
      writeStream.end();
    };
    await pump();

    writeStream.on("finish", () => {
      console.log(`✅ Download complete: ${outputFilename}`);
    });
    writeStream.on("error", (err) => {
      console.error("Error writing to file:", err);
    });
  } catch (err) {
    console.error("Error during download:", err);
  }
}

// If invoked directly via `node downloadCloudinaryFile.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      "Usage: node downloadCloudinaryFile.js <public_id> [resource_type] [output_filename]"
    );
    process.exit(1);
  }

  const [publicId, resourceType = "raw", outputFilename] = args;
  // Try to infer format from outputFilename or default to "pdf"
  let format = "pdf";
  if (outputFilename) {
    const ext = path.extname(outputFilename).replace(".", "");
    if (ext) format = ext;
  }

  // 1. Generate signed URL
  const signedUrl = generateSignedUrl(publicId, resourceType, format);
  console.log("Using signed URL:", signedUrl);

  // 2. Download via fetch
  await fetchAndSave(signedUrl, outputFilename);
}

// Export functions for programmatic use:
export { generateSignedUrl, fetchAndSave };
