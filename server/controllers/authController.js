const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const transporter = require('../config/mail'); // Importing your new mail setup

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
  const { firstName, lastName, email, phone, address, password } = req.body;

  try {
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
      role: 'user' // Standardized to 'user'
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
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Authenticate a user (Step 1: Check Password & Send Email)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      // 1. Generate 6-digit code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. Save code and set an expiration time (10 minutes from now)
      user.twoFactorCode = otpCode;
      user.twoFactorExpires = Date.now() + 10 * 60 * 1000; 
      await user.save();

      // 3. Send the email
      const mailOptions = {
        from: '"RedBrick Security" malibualemanya@gmail.com',
        to: user.email,
        subject: 'Your RBC Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Security Verification</h2>
            <p>Your 2FA login code is: <b style="font-size: 24px; color: #590016;">${otpCode}</b></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      // 4. Tell frontend to show the 2FA input screen
      res.status(200).json({
        message: "2FA code sent to email",
        requires2FA: true,
        email: user.email // Send this back so the frontend knows who is verifying
      });

    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify 2FA Code (Step 2: Log the user in)
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2FA = async (req, res) => {
  const { email, otpCode } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exists, code matches, AND code isn't expired
    if (user && user.twoFactorCode === otpCode && user.twoFactorExpires > Date.now()) {
      
      // Clear the codes from the database so they can't be reused
      user.twoFactorCode = undefined;
      user.twoFactorExpires = undefined;
      await user.save();

      // Finally, send the real login data!
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
    console.error("2FA Verification Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verify2FA // Don't forget to export the new function!
};  