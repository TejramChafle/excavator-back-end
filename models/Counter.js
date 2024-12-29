const mongoose = require('mongoose');

// Counter schema for tracking invoice numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // The identifier for the counter (e.g., 'invoice')
  seq: { type: Number, default: 0 } // The current sequence number
});

module.exports = mongoose.model('Counter', counterSchema);