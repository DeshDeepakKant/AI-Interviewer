import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return "There is no local Path"

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("File is Uploaded", response.url)

        // after upload remove them from the local server
        fs.unlink(localFilePath)
        return response

    } catch (error) {
        // remove the locally saved tempoary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return error
    }
}


// Todo
const deleteOldFromCloudinary = async(url)=>{
    try {
        
    } catch (error) {
        
    }
}

export {uploadOnCloudinary}