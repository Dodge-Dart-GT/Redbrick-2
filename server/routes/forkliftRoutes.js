const express = require('express');
const router = express.Router();
const Forklift = require('../models/Forklift');
const RentalRequest = require('../models/RentalRequest'); 
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// 1. GET ALL FORKLIFTS 
router.get('/', async (req, res) => {
  try {
    // THE FIX: Greatly simplified. It now pulls the dates directly from the database!
    const forklifts = await Forklift.find({});
    res.json(forklifts);
  } catch (error) {
    console.error("Error fetching forklifts:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- NEW: ADD A VERIFIED REVIEW ---
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment, images } = req.body;

  try {
    const forklift = await Forklift.findById(req.params.id);

    if (forklift) {
      const alreadyReviewed = forklift.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this specific equipment.' });

      const hasCompletedRental = await RentalRequest.findOne({
        user: req.user._id,
        forklift: req.params.id,
        status: 'Completed'
      });
      if (!hasCompletedRental) return res.status(400).json({ message: 'You can only leave a review after your rental agreement is marked as Completed.' });

      const review = {
        user: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        rating: Number(rating),
        comment,
        images: images || []
      };

      forklift.reviews.push(review);
      forklift.numReviews = forklift.reviews.length;
      forklift.rating = forklift.reviews.reduce((acc, item) => item.rating + acc, 0) / forklift.reviews.length;

      await forklift.save();
      res.status(201).json({ message: 'Review added successfully!' });
    } else {
      res.status(404).json({ message: 'Forklift not found.' });
    }
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: 'Server error while submitting review.' });
  }
});

// 2. ADD A NEW FORKLIFT (Secured)
router.post('/', protect, adminOrOwner, async (req, res) => {
  try {
    const forklift = await Forklift.create(req.body);
    res.status(201).json(forklift);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Data' });
  }
});

// 3. UPDATE STATUS, DETAILS, AND IMAGES (Secured)
router.put('/:id', protect, adminOrOwner, async (req, res) => {
  try {
    const forklift = await Forklift.findById(req.params.id);
    if (!forklift) return res.status(404).json({ message: 'Forklift not found' });

    // THE FIX: HARD BACKEND SECURITY LOCK
    // If the forklift is out on a job, block ANY manual status change to Maintenance
    if (forklift.status === 'Rented' && req.body.status && req.body.status !== 'Rented') {
        return res.status(403).json({ message: 'Security Block: Cannot manually change status. Vehicle must be returned via Customer Agreements.' });
    }

    forklift.make = req.body.make || forklift.make;
    forklift.model = req.body.model || forklift.model;
    forklift.capacity = req.body.capacity || forklift.capacity;
    forklift.power = req.body.power || forklift.power;
    forklift.torque = req.body.torque || forklift.torque;
    forklift.fuel = req.body.fuel || forklift.fuel;
    
    // Only apply the status update if it wasn't blocked above
    if (req.body.status) forklift.status = req.body.status;
    
    forklift.image = req.body.image || forklift.image;
    forklift.images = req.body.images || forklift.images;

    const updatedForklift = await forklift.save();
    res.json(updatedForklift);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// 4. DELETE FORKLIFT (Secured)
router.delete('/:id', protect, adminOrOwner, async (req, res) => {
  try {
    const forklift = await Forklift.findById(req.params.id);
    if (forklift) {
      await forklift.deleteOne();
      res.json({ message: 'Forklift removed' });
    } else {
      res.status(404).json({ message: 'Forklift not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;