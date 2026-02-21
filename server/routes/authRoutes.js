const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Ensure these lines are UN-COMMENTED
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
