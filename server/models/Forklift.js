const mongoose = require('mongoose');

// 1. Create the schema for individual reviews
const reviewSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  images: [String] 
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
  
  // --- THE FIX: ADDED PERMANENT RETURN DATE FIELD ---
  nextAvailableDate: { type: Date }, 

  reviews: [reviewSchema], 
  rating: { type: Number, required: true, default: 0 }, 
  numReviews: { type: Number, required: true, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Forklift', forkliftSchema);