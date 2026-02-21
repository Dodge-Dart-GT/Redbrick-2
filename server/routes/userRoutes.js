const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Needed for password hashing

// 1. GET ALL USERS (Admin/Owner View)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. UPDATE USER ROLE (Admin/Owner Action)
router.put('/:id/role', async (req, res) => {
  const { role } = req.body; // 'admin' or 'user'

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'owner') {
        return res.status(403).json({ message: 'Cannot change the Owner role.' });
      }

      user.role = role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// 3. UPDATE OWN PROFILE (User Action) - NEW
router.put('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Update fields if they are provided in the body
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      
      // Only hash and update password if a new one is sent
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();
      
      // Return updated info (exclude password)
      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Profile Update Failed' });
  }
});

module.exports = router;
