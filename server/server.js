const express = require('express');
const dotenv = require('dotenv');

// 1. LOAD ENVIRONMENT VARIABLES FIRST!
dotenv.config(); 

const cors = require('cors');
const connectDB = require('./config/db');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const forkliftRoutes = require('./routes/forkliftRoutes'); 
const rentalRoutes = require('./routes/rentalRoutes');    
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// 2. Connect to Database
connectDB();

const app = express();

// 3. Middleware
// THE FIX: Secure CORS Configuration for Render & Netlify Deployment
const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman during testing) or if the origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); // Allows server to read JSON data

// 4. Routes
app.use('/api/auth', authRoutes);         // Login & Register
app.use('/api/upload', uploadRoutes);     // Image Uploads (Cloudinary)
app.use('/api/forklifts', forkliftRoutes);// Manage Forklift Inventory
app.use('/api/rentals', rentalRoutes);    // Manage Rental Requests
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes); // Analytics Dashboard

// Default Route (To check if server is working live on Render)
app.get('/', (req, res) => {
  res.send('Red Brick API is running successfully...');
});

// 5. Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});