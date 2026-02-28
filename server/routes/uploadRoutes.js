const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary'); 
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// THE FIX: We only import 'protect', we removed 'adminOrOwner'
const { protect } = require('../middleware/authMiddleware'); 

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = CloudinaryStorage({
  cloudinary: cloudinary, 
  folder: 'forklifts',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
});

const upload = multer({ storage: storage });

// THE FIX: Removed 'adminOrOwner' from this line so customers can upload review images!
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file was provided or upload failed.' });
  }

  const imageUrl = req.file.secure_url || req.file.url || req.file.path;
  
  // Return 'url' explicitly to match our CustomerDashboard.jsx expectations
  res.status(200).json({ image: imageUrl, url: imageUrl });
});

module.exports = router;