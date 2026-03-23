const express = require('express');
const router = express.Router();

// We added verify2FA to the import list so the router knows what function to run
const { registerUser, loginUser, verify2FA } = require('../controllers/authController');

// Ensure these lines are UN-COMMENTED
router.post('/register', registerUser);
router.post('/login', loginUser);

// NEW: The route to catch the 6-digit code from the frontend
router.post('/verify-2fa', verify2FA);

module.exports = router;