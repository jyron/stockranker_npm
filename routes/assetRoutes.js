const express = require('express');
const Asset = require('../models/Asset');
const Comment = require('../models/Comment'); // Add this line to use the Comment model
const router = express.Router();
const { isAuthenticated } = require('./middleware/authMiddleware'); // Add this line to use the authentication middleware

// Get all assets
router.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.find({});
    console.log('Fetched all assets');
    res.json(assets);
  } catch (error) {
    console.error('Error fetching all assets:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching all assets', error: error.message });
  }
});

// Get a single asset by ticker
router.get('/assets/:ticker', async (req, res) => {
  try {
    const asset = await Asset.findOne({ ticker: req.params.ticker });
    if (!asset) {
      console.log(`Asset with ticker ${req.params.ticker} not found`);
      return res.status(404).json({ message: 'Asset not found' });
    }
    console.log(`Fetched asset with ticker ${req.params.ticker}`);
    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching asset', error: error.message });
  }
});

// Create a new asset
router.post('/assets', async (req, res) => {
  try {
    const asset = new Asset(req.body);
    const newAsset = await asset.save();
    console.log(`Created new asset with ticker ${req.body.ticker}`);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error('Error creating asset:', error.message, error.stack);
    res.status(400).json({ message: 'Error creating asset', error: error.message });
  }
});

// Update an asset
router.put('/assets/:ticker', async (req, res) => {
  try {
    const updatedAsset = await Asset.findOneAndUpdate({ ticker: req.params.ticker }, req.body, { new: true });
    console.log(`Updated asset with ticker ${req.params.ticker}`);
    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error.message, error.stack);
    res.status(400).json({ message: 'Error updating asset', error: error.message });
  }
});

// Delete an asset
router.delete('/assets/:ticker', async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ ticker: req.params.ticker });
    if (!asset) {
      console.log(`Asset with ticker ${req.params.ticker} not found for deletion`);
      return res.status(404).json({ message: 'Asset not found' });
    }
    console.log(`Deleted asset with ticker ${req.params.ticker}`);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting asset', error: error.message });
  }
});

// Update vote count for an asset
router.post('/assets/:ticker/vote', isAuthenticated, async (req, res) => {
  try {
    const { vote } = req.body; // Assuming vote is either 1 (upvote) or -1 (downvote)
    const asset = await Asset.findOneAndUpdate({ ticker: req.params.ticker }, { $inc: { voteCount: vote }}, { new: true });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
    console.log(`Vote updated for asset with ticker ${req.params.ticker}`);
  } catch (error) {
    console.error('Error updating asset vote:', error.message, error.stack);
    res.status(500).json({ message: 'Error updating vote', error: error.message });
  }
});

// Fetch comments for an asset
router.get('/assets/:ticker/comments', async (req, res) => {
  try {
    const asset = await Asset.findOne({ ticker: req.params.ticker });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const comments = await Comment.find({ assetId: asset._id }).sort({ timestamp: -1 });
    res.json(comments);
    console.log(`Comments fetched for asset with ticker ${req.params.ticker}`);
  } catch (error) {
    console.error('Error fetching comments:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

module.exports = router;