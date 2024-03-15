const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Asset = require('../models/Asset'); // Required for updating comment count
const mongoose = require('mongoose');

// Post a new comment
router.post('/comments', async (req, res) => {
  try {
    const { author, assetId, text } = req.body;
    // Validate assetId
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      console.error(`Invalid assetId: ${assetId}`);
      return res.status(400).json({ message: 'Invalid asset ID' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      console.log(`Asset with id ${assetId} not found`);
      return res.status(404).json({ message: 'Asset not found' });
    }
    const newComment = await Comment.create({ author, assetId, text });
    // Update comment count for the asset
    asset.commentCount += 1;
    await asset.save();
    console.log('New comment created:', newComment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// Get comments for an asset
router.get('/comments/assets/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      console.error(`Invalid assetId: ${assetId}`);
      return res.status(400).json({ message: 'Invalid asset ID' });
    }
    const comments = await Comment.find({ assetId }).sort({ timestamp: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments for asset:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

module.exports = router;