const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Post a new comment
router.post('/comments', async (req, res) => {
  try {
    const { author, assetId, text } = req.body;
    const newComment = await Comment.create({ author, assetId, text });
    console.log('New comment created:', newComment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// Get comments for an asset
router.get('/comments/asset/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const comments = await Comment.find({ assetId }).sort({ timestamp: -1 }); // Newest first
    console.log(`Comments fetched for assetId ${assetId}`, comments);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments for asset:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

module.exports = router;