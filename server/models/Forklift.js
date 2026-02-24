const mongoose = require('mongoose');

const forkliftSchema = mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  
  // Specs
  capacity: { type: String },
  power: { type: String },
  torque: { type: String },
  fuel: { type: String },
  
  // Image (URL from Cloudinary)
  images: [{ type: String }],

  // Status for the Owner to manage
  status: { 
    type: String, 
    enum: ['Available', 'Rented', 'Maintenance'], 
    default: 'Available' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Forklift', forkliftSchema);
