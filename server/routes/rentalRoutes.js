const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Forklift = require('../models/Forklift');
const { protect } = require('../middleware/authMiddleware'); // <-- IMPORTED SECURITY MIDDLEWARE

router.post('/', protect, async (req, res) => {
  // We no longer need userId from req.body because 'protect' securely provides it via req.user
  const { forkliftId, startDate, endDate } = req.body;

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
      user: req.user._id, // <-- SECURELY EXTRACTS ID FROM LOGGED-IN USER TOKEN
      forklift: forkliftId, 
      startDate: start, 
      endDate: end, 
      status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Server Error: Could not process request' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const requests = await RentalRequest.find({})
      .populate('user', 'firstName lastName email phone address')
      // Added 'images' to ensure multi-image arrays load for the admin
      .populate('forklift', 'make model image images capacity power');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/myrequests/:userId', protect, async (req, res) => {
  try {
    // Security check: ensure user is only fetching their own requests
    if (req.user._id.toString() !== req.params.userId) {
        return res.status(401).json({ message: 'Not authorized to view these records' });
    }

    const requests = await RentalRequest.find({ user: req.params.userId })
      // Added 'images' here so the thumbnails show up on the Customer Dashboard
      .populate('forklift', 'make model image images capacity power torque fuel');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Note: If you want to restrict approvals to admins/owners, you can add adminOrOwner middleware here later!
router.put('/:id', async (req, res) => {
  const { status, rejectionReason } = req.body; 
  
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
      
      // AUTO-REJECT LOGIC
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