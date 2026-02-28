const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  totalCost: { 
    type: Number,
    default: 0
  },
  status: {
    type: String,
    // --- THE FIX: ADDED 'Cancelled' TO THE ENUM LIST ---
    enum: ['Pending', 'Active', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  rejectionReason: { 
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);