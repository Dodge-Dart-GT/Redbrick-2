const express = require('express');
const router = express.Router();
const Forklift = require('../models/Forklift');

// 1. GET ALL FORKLIFTS
router.get('/', async (req, res) => {
  try {
    const forklifts = await Forklift.find({});
    res.json(forklifts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. ADD A NEW FORKLIFT
router.post('/', async (req, res) => {
  try {
    const forklift = await Forklift.create(req.body);
    res.status(201).json(forklift);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Data' });
  }
});

// 3. UPDATE STATUS
router.put('/:id', async (req, res) => {
  try {
    const forklift = await Forklift.findById(req.params.id);
    if (forklift) {
      forklift.status = req.body.status || forklift.status;
      const updatedForklift = await forklift.save();
      res.json(updatedForklift);
    } else {
      res.status(404).json({ message: 'Forklift not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// 4. DELETE FORKLIFT (NEW)
router.delete('/:id', async (req, res) => {
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
