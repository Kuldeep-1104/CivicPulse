// backend/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Load .env from root
dotenv.config({ path: '../.env' })

// Validate Cloudinary keys
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('CLOUDINARY KEYS MISSING! Check .env')
  process.exit(1)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'civicpulse',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error.message)
          return reject(error)
        }
        console.log('Uploaded:', result.secure_url)
        resolve(result.secure_url)
      }
    )

    uploadStream.end(fileBuffer) // ← FIXED: .end() now works
  })
}