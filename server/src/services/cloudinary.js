// Cloudinary service — configured via CLOUDINARY_URL or the three vars below.
// In demo mode (no keys), image uploads pass through as URLs/data so the admin
// CRUD still works; wire real keys for production uploads.
async function uploadImage(image) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !image?.startsWith("data:")) return image; // URL passthrough
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET });
  const out = await cloudinary.uploader.upload(image, { folder: "maison-noor" });
  return out.secure_url;
}
module.exports = { uploadImage };
