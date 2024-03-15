const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  ticker: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  price: { type: Number, required: true },
  voteCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  industry: { type: String, required: true }
}, { timestamps: true });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;