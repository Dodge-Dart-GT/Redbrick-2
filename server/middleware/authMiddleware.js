const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. PROTECT ROUTE: Verifies if the user is logged in via JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. ADMIN/OWNER ONLY: Only allows users with privileged roles
const adminOrOwner = (req, res, next) => {
  // THE FIX: Now includes 'staff' as a valid high-level role
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff' || req.user.role === 'owner')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin, staff, or owner' });
  }
};

module.exports = { protect, adminOrOwner };