const mongoose = require('mongoose');

// 1. Create the schema for individual reviews
const reviewSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  images: [String] // Array to hold uploaded image URLs from the customer
}, { timestamps: true });

// 2. Update the main Forklift schema
const forkliftSchema = mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  capacity: { type: String },
  power: { type: String },
  torque: { type: String },
  fuel: { type: String },
  status: { type: String, default: 'Available' },
  image: { type: String }, 
  images: [String], 
  
  // --- NEW REVIEW FIELDS ---
  reviews: [reviewSchema], // Embeds the reviews directly into the vehicle
  rating: { type: Number, required: true, default: 0 }, // Average star rating
  numReviews: { type: Number, required: true, default: 0 } // Total number of reviews
}, { timestamps: true });

module.exports = mongoose.model('Forklift', forkliftSchema);