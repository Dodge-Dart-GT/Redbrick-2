const express = require('express');
const router = express.Router();
const Forklift = require('../models/Forklift');
const RentalRequest = require('../models/RentalRequest'); 
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// 1. GET ALL FORKLIFTS (Public Route - No 'protect' middleware)
router.get('/', async (req, res) => {
  try {
    const forklifts = await Forklift.find({});
    res.json(forklifts);
  } catch (error) {
    console.error("Error fetching forklifts:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- ADD A VERIFIED REVIEW ---
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

    // HARD BACKEND SECURITY LOCK
    if (forklift.status === 'Rented' && req.body.status && req.body.status !== 'Rented') {
        return res.status(403).json({ message: 'Security Block: Cannot manually change status. Vehicle must be returned via Customer Agreements.' });
    }

    // THE FIX: Strict undefined checking ensures empty strings and empty arrays are saved!
    if (req.body.make !== undefined) forklift.make = req.body.make;
    if (req.body.model !== undefined) forklift.model = req.body.model;
    if (req.body.capacity !== undefined) forklift.capacity = req.body.capacity;
    if (req.body.power !== undefined) forklift.power = req.body.power;
    if (req.body.torque !== undefined) forklift.torque = req.body.torque;
    if (req.body.fuel !== undefined) forklift.fuel = req.body.fuel;
    if (req.body.status !== undefined) forklift.status = req.body.status;
    
    // Explicitly update image and images arrays
    if (req.body.image !== undefined) forklift.image = req.body.image;
    if (req.body.images !== undefined) forklift.images = req.body.images;

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