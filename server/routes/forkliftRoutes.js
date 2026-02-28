const express = require('express');
const router = express.Router();
const Forklift = require('../models/Forklift');
const RentalRequest = require('../models/RentalRequest'); // <-- IMPORTED THIS!
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// 1. GET ALL FORKLIFTS (Publicly visible for catalog)
router.get('/', async (req, res) => {
  try {
    const forklifts = await Forklift.find({});
    
    // Find all currently active rentals
    const activeRentals = await RentalRequest.find({ status: 'Active' });

    // Map through forklifts and attach the return date if it is currently rented
    const inventoryWithDates = forklifts.map(forklift => {
      let nextDate = null;
      if (forklift.status === 'Rented') {
        // Match the forklift to its active rental
        const activeJob = activeRentals.find(r => r.forklift.toString() === forklift._id.toString());
        if (activeJob) nextDate = activeJob.endDate;
      }
      // Combine the original forklift data with our new date
      return { ...forklift.toObject(), nextAvailableDate: nextDate };
    });

    res.json(inventoryWithDates);
  } catch (error) {
    console.error("Error fetching forklifts:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- NEW: ADD A VERIFIED REVIEW ---
// @desc    Create a new verified review
// @route   POST /api/forklifts/:id/reviews
// @access  Private (Must be logged in)
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment, images } = req.body;

  try {
    const forklift = await Forklift.findById(req.params.id);

    if (forklift) {
      // 1. Check if the user already reviewed this exact forklift
      const alreadyReviewed = forklift.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this specific equipment.' });
      }

      // 2. SECURITY CHECK: Did they actually complete a rental for it?
      const hasCompletedRental = await RentalRequest.findOne({
        user: req.user._id,
        forklift: req.params.id,
        status: 'Completed'
      });

      if (!hasCompletedRental) {
        return res.status(400).json({ message: 'You can only leave a review after your rental agreement is marked as Completed.' });
      }

      // 3. Create the review
      const review = {
        user: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        rating: Number(rating),
        comment,
        images: images || []
      };

      forklift.reviews.push(review);

      // 4. Update the totals and calculate the new average star rating
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
    if (forklift) {
      // Update all text specifications
      forklift.make = req.body.make || forklift.make;
      forklift.model = req.body.model || forklift.model;
      forklift.capacity = req.body.capacity || forklift.capacity;
      forklift.power = req.body.power || forklift.power;
      forklift.torque = req.body.torque || forklift.torque;
      forklift.fuel = req.body.fuel || forklift.fuel;
      forklift.status = req.body.status || forklift.status;
      
      // Update the images (Supports both direct URLs and uploaded Cloudinary arrays)
      forklift.image = req.body.image || forklift.image;
      forklift.images = req.body.images || forklift.images;

      const updatedForklift = await forklift.save();
      res.json(updatedForklift);
    } else {
      res.status(404).json({ message: 'Forklift not found' });
    }
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