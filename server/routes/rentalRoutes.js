const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Forklift = require('../models/Forklift');

// 1. CREATE REQUEST (With Date Calculation)
router.post('/', async (req, res) => {
  const { userId, forkliftId, durationDays } = req.body;

  try {
    // Check if user already has a pending request for this specific forklift
    const existing = await RentalRequest.findOne({ user: userId, forklift: forkliftId, status: 'Pending' });
    if (existing) return res.status(400).json({ message: 'Request already exists' });

    // Calculate End Date
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + parseInt(durationDays));

    const request = await RentalRequest.create({
      user: userId,
      forklift: forkliftId,
      startDate: start,
      endDate: end, // Automatically set
      status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: 'Request Failed' });
  }
});

// 2. GET ALL REQUESTS
router.get('/all', async (req, res) => {
  try {
    const requests = await RentalRequest.find({})
      .populate('user', 'firstName lastName email')
      .populate('forklift', 'make model image');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. GET MY REQUESTS
router.get('/myrequests/:userId', async (req, res) => {
  try {
    const requests = await RentalRequest.find({ user: req.params.userId })
      .populate('forklift', 'make model image');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. UPDATE STATUS (Automatic Forklift Update)
router.put('/:id', async (req, res) => {
  const { status } = req.body; // "Active", "Rejected", "Completed"
  
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    // AUTOMATION LOGIC:
    // If Owner accepts ('Active'), mark forklift as 'Rented'
    if (status === 'Active') {
      await Forklift.findByIdAndUpdate(request.forklift, { status: 'Rented' });
    }
    
    // If Rental is done ('Completed'), mark forklift as 'Available'
    if (status === 'Completed') {
      await Forklift.findByIdAndUpdate(request.forklift, { status: 'Available' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;
