const express = require('express');
const router = express.Router();
const Forklift = require('../models/Forklift');
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// 1. GET ALL FORKLIFTS (Publicly visible for catalog)
router.get('/', async (req, res) => {
  try {
    const forklifts = await Forklift.find({});
    res.json(forklifts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
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