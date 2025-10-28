import { asyncHandler } from '../utils/asyncHandler.js'; // hvatanje grešaka za async
import cloudinary from '../config/cloudinary.js'; // Cloudinary SDK instanca (konfigurisana)

// POST /api/media/upload
export const uploadImage = asyncHandler(async (req, res) => {
  // očekuje da multer već postavi req.file (upload preko form-data)
  if (!req.file) {
    const e = new Error('No file uploaded');
    e.status = 400;
    throw e;
  }

  // upload na Cloudinary, u folder 'dragdropcms'
  const uploaded = await cloudinary.uploader.upload(req.file.path, {
    folder: 'dragdropcms',
    resource_type: 'image',
  });

  // vrati sigurni URL koji možeš čuvati u bazi
  res.json({ url: uploaded.secure_url });
});
