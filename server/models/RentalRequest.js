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
  totalCost: { // <-- NEW FIELD FOR INCOME TRENDS
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: { 
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);