const express = require('express');
const router = express.Router();

// 1. THE FIX: Import the base cloudinary package, NOT .v2
const cloudinary = require('cloudinary'); 
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// 2. Configure using .v2.config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = CloudinaryStorage({
  cloudinary: cloudinary, // Now passing the base package!
  folder: 'forklifts',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
});

const upload = multer({ storage: storage });

router.post('/', protect, adminOrOwner, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file was provided or upload failed.' });
  }

  // Older versions sometimes map the URL to 'secure_url' or 'url' instead of 'path'
  const imageUrl = req.file.secure_url || req.file.url || req.file.path;
  
  res.status(200).json({ image: imageUrl });
});

module.exports = router;