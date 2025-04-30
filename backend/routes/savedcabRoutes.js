const express = require('express');
const router = express.Router();
const SavedCab = require('../models/SavedCab');

// POST /api/saved-cabs
// Save a new cab
router.post('/saved-cabs', async (req, res) => {
    const { email, driverName, phoneNumber, plateNumber } = req.body;
    try {
      const newCab = new SavedCab({ email, driverName, phoneNumber, plateNumber });
      await newCab.save();
      res.status(201).json(newCab);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save cab' });
    }
  });
  
  // GET /api/saved-cabs/:email
  // Get all saved cabs for a user
  router.get('/saved-cabs/:email', async (req, res) => {
    try {
      const cabs = await SavedCab.find({ email: req.params.email });
      res.json(cabs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch cabs' });
    }
  });

  // DELETE /api/saved-cabs/:id
router.delete('/saved-cabs/:id', async (req, res) => {
    try {
      await SavedCab.findByIdAndDelete(req.params.id);
      res.json({ message: 'Cab deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete cab' });
    }
  });
  

  module.exports = router;