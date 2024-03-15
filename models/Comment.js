const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: { type: String, required: false }, // Optional to allow anonymous comments
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

commentSchema.index({ assetId: 1 }); // Indexing by assetId for efficient querying

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;