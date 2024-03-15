const express = require('express');
const Asset = require('../models/Asset');
const Comment = require('../models/Comment');
const router = express.Router();
const { isAuthenticated } = require('./middleware/authMiddleware');

// Get all assets
router.get('/assets', async (req, res) => {
  try {
    let query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { ticker: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const assets = await Asset.find(query);
    console.log('Fetched all assets with query:', req.query);
    res.json(assets);
  } catch (error) {
    console.error('Error fetching all assets:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching all assets', error: error.message });
  }
});

// Get a single asset by ticker, handling both uppercase and lowercase tickers
router.get('/assets/:ticker', async (req, res) => {
  try {
    const tickerUpperCase = req.params.ticker.toUpperCase();
    const asset = await Asset.findOne({ ticker: tickerUpperCase });
    if (!asset) {
      console.log(`Asset with ticker ${tickerUpperCase} not found`);
      return res.status(404).json({ message: 'Asset not found' });
    }
    console.log(`Fetched asset with ticker ${tickerUpperCase}`);
    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching asset', error: error.message });
  }
});

// Route to render asset detail page
router.get('/assets/:ticker/detail', async (req, res) => {
  try {
    const tickerUpperCase = req.params.ticker.toUpperCase();
    const asset = await Asset.findOne({ ticker: tickerUpperCase }).lean();
    if (!asset) {
      console.log(`Asset with ticker ${tickerUpperCase} not found for detail page.`);
      return res.status(404).send('Asset not found');
    }
    console.log(`Rendering detail page for asset with ticker ${tickerUpperCase}`);
    const comments = await Comment.find({ assetId: asset._id }).sort({ timestamp: -1 }).lean();
    res.render('assetDetail', { asset, comments });
  } catch (error) {
    console.error('Error rendering asset detail page:', error.message, error.stack);
    res.status(500).send('Error rendering asset detail page');
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
    const tickerUpperCase = req.params.ticker.toUpperCase();
    const updatedAsset = await Asset.findOneAndUpdate({ ticker: tickerUpperCase }, req.body, { new: true });
    console.log(`Updated asset with ticker ${tickerUpperCase}`);
    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error.message, error.stack);
    res.status(400).json({ message: 'Error updating asset', error: error.message });
  }
});

// Delete an asset
router.delete('/assets/:ticker', async (req, res) => {
  try {
    const tickerUpperCase = req.params.ticker.toUpperCase();
    const asset = await Asset.findOneAndDelete({ ticker: tickerUpperCase });
    if (!asset) {
      console.log(`Asset with ticker ${tickerUpperCase} not found for deletion`);
      return res.status(404).json({ message: 'Asset not found' });
    }
    console.log(`Deleted asset with ticker ${tickerUpperCase}`);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting asset', error: error.message });
  }
});

// Update vote count for an asset
router.post('/assets/:ticker/vote', isAuthenticated, async (req, res) => {
  try {
    const { vote } = req.body;
    const tickerUpperCase = req.params.ticker.toUpperCase();
    const asset = await Asset.findOneAndUpdate({ ticker: tickerUpperCase }, { $inc: { voteCount: vote }}, { new: true });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
    console.log(`Vote updated for asset with ticker ${tickerUpperCase}`);
  } catch (error) {
    console.error('Error updating asset vote:', error.message, error.stack);
    res.status(500).json({ message: 'Error updating vote', error: error.message });
  }
});

// Fetch comments for an asset by ticker, now correctly using tickerUpperCase for consistency
router.get('/assets/:ticker/comments', async (req, res) => {
  try {
    const tickerUpperCase = req.params.ticker.toUpperCase();
    const asset = await Asset.findOne({ ticker: tickerUpperCase });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const comments = await Comment.find({ assetId: asset._id }).sort({ timestamp: -1 });
    res.json(comments);
    console.log(`Comments fetched for asset with ticker ${tickerUpperCase}`);
  } catch (error) {
    console.error('Error fetching comments:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

module.exports = router;