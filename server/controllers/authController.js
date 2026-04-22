const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const transporter = require('../config/mail'); 

// --- BULLETPROOF SANITIZATION BLOCK ---
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const window = new JSDOM('').window;
const purify = createDOMPurify(window);

const sanitizeInput = (input) => {
  try {
    if (typeof input === 'string' && input.trim() !== '') {
      return purify.sanitize(input.trim());
    }
    return input;
  } catch (err) {
    console.error("🚨 Sanitizer tripped up on:", input, err);
    return input; 
  }
};
// ----------------------------------------------

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const firstName = sanitizeInput(req.body.firstName);
    const lastName = sanitizeInput(req.body.lastName);
    const email = sanitizeInput(req.body.email);
    const phone = sanitizeInput(req.body.phone);
    const address = sanitizeInput(req.body.address);
    const password = req.body.password; 

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      address, 
      password: hashedPassword,
      role: 'user' 
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role, 
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("🚨 Registration Error Engine Stall:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate a user (Step 1: Check Password & Send Email)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      user.twoFactorCode = otpCode;
      user.twoFactorExpires = Date.now() + 10 * 60 * 1000; 
      await user.save();

      const mailOptions = {
        from: '"RedBrick Security" malibualemanya@gmail.com',
        to: user.email,
        subject: 'Your RBC Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Security Verification</h2>
            <p>Your 2FA login code is: <b style="font-size: 24px; color: #B22222;">${otpCode}</b></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `
      };

      // --- MAILTRAP BYPASS IMPLEMENTED HERE ---
      // await transporter.sendMail(mailOptions);
      console.log(`\n=========================================\n🚨 BYPASS 2FA CODE FOR ${user.email}:\n🚨 >>>> ${otpCode} <<<<\n=========================================\n`);

      res.status(200).json({
        message: "2FA code generated (Email Bypassed)",
        requires2FA: true,
        email: user.email 
      });

    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("🚨 Login Error Engine Stall:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify 2FA Code (Step 2: Log the user in)
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2FA = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const otpCode = sanitizeInput(req.body.otpCode);

    const user = await User.findOne({ email });

    if (user && user.twoFactorCode === otpCode && user.twoFactorExpires > Date.now()) {
      
      user.twoFactorCode = undefined;
      user.twoFactorExpires = undefined;
      await user.save();

      res.json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.toLowerCase(),
        token: generateToken(user._id),
      });

    } else {
      res.status(400).json({ message: 'Invalid or expired 2FA code' });
    }
  } catch (error) {
    console.error("🚨 2FA Verification Error Engine Stall:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verify2FA 
};