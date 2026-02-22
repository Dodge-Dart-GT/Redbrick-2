const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Forklift = require('../models/Forklift');

router.post('/', async (req, res) => {
  const { userId, forkliftId, startDate, endDate } = req.body;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    const overlappingRequests = await RentalRequest.find({
      forklift: forkliftId,
      status: 'Active', 
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Conflict: This forklift has already been approved for another customer on these dates.' 
      });
    }

    const request = await RentalRequest.create({
      user: userId, forklift: forkliftId, startDate: start, endDate: end, status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not process request' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const requests = await RentalRequest.find({})
      .populate('user', 'firstName lastName email phone address')
      .populate('forklift', 'make model image capacity power');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/myrequests/:userId', async (req, res) => {
  try {
    const requests = await RentalRequest.find({ user: req.params.userId })
      .populate('forklift', 'make model image');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  const { status, rejectionReason } = req.body; // <-- Receive reason from frontend
  
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;

    // Save manual rejection reason if provided
    if (status === 'Rejected') {
      request.rejectionReason = rejectionReason || 'Declined by Administrator.';
    }

    await request.save();

    if (status === 'Active') {
      await Forklift.findByIdAndUpdate(request.forklift, { status: 'Rented' });
      
      // AUTO-REJECT LOGIC (Now includes the reason!)
      await RentalRequest.updateMany(
        {
          _id: { $ne: request._id }, 
          forklift: request.forklift,
          status: 'Pending',
          $or: [
            { startDate: { $lte: request.endDate }, endDate: { $gte: request.startDate } }
          ]
        },
        { 
          $set: { 
            status: 'Rejected',
            rejectionReason: 'Schedule Conflict: This forklift was booked by another customer for these overlapping dates.'
          } 
        }
      );
    }
    
    if (status === 'Completed') {
      await Forklift.findByIdAndUpdate(request.forklift, { status: 'Available' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;
