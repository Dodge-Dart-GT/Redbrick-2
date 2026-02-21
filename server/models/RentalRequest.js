const mongoose = require('mongoose');

const rentalSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  forklift: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Forklift', 
    required: true 
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }, // Optional: Owner can set this later
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Rejected', 'Completed', 'Due Today'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('RentalRequest', rentalSchema);
