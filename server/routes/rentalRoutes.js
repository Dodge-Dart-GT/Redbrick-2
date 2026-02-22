const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Forklift = require('../models/Forklift');

// 1. CREATE REQUEST (Only blocks if an overlap is already 'Active')
router.post('/', async (req, res) => {
  const { userId, forkliftId, startDate, endDate } = req.body;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    // OVERLAP CHECK: Only look for 'Active' (Approved) requests
    const overlappingRequests = await RentalRequest.find({
      forklift: forkliftId,
      status: 'Active', 
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Conflict: This forklift has already been approved for another customer on these dates.' 
      });
    }

    // If no ACTIVE overlaps, create the pending request!
    const request = await RentalRequest.create({
      user: userId,
      forklift: forkliftId,
      startDate: start,
      endDate: end,
      status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not process request' });
  }
});

// 2. GET ALL REQUESTS (Includes Phone, Address, Capacity, and Power for the Modal)
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

// 4. UPDATE STATUS (With Auto-Reject Logic)
router.put('/:id', async (req, res) => {
  const { status } = req.body; 
  
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    // If Owner accepts ('Active')
    if (status === 'Active') {
      // 1. Mark forklift as 'Rented'
      await Forklift.findByIdAndUpdate(request.forklift, { status: 'Rented' });
      
      // 2. AUTO-REJECT any other 'Pending' requests for this forklift that overlap with these dates
      await RentalRequest.updateMany(
        {
          _id: { $ne: request._id }, // Do not reject the one we just accepted!
          forklift: request.forklift,
          status: 'Pending',
          $or: [
            {
              startDate: { $lte: request.endDate },
              endDate: { $gte: request.startDate }
            }
          ]
        },
        { $set: { status: 'Rejected' } }
      );
    }
    
    // If Rental is done ('Completed')
    if (status === 'Completed') {
      await Forklift.findByIdAndUpdate(request.forklift, { status: 'Available' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;
