const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// 1. Removed the curly braces to import the older version correctly
const CloudinaryStorage = require('multer-storage-cloudinary'); 
const multer = require('multer');

// IMPORT YOUR SECURITY MIDDLEWARE
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Removed the 'new' keyword and the 'params' wrapper for V2/V3 compatibility
const storage = CloudinaryStorage({ 
  cloudinary: cloudinary,
  folder: 'forklifts', 
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
});

const upload = multer({ storage: storage });

// SECURE THE ROUTE
router.post('/', protect, adminOrOwner, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file was provided or upload failed.' });
  }

  // 3. Older versions sometimes store the URL in 'secure_url' instead of 'path'
  const imageUrl = req.file.secure_url || req.file.path;
  
  res.status(200).json({ image: imageUrl });
});

module.exports = router;