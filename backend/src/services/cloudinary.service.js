// backend/src/services/cloudinary.service.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs-extra');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function uploadFile(localPath, folder = 'shopify-wa') {
  if (!process.env.CLOUDINARY_API_KEY) throw new Error('CLOUDINARY not configured');
  const res = await cloudinary.uploader.upload(localPath, { folder, resource_type: 'auto' });
  // optionally remove local file
  try { await fs.remove(localPath); } catch(e){}
  return res;
}

module.exports = { uploadFile };
