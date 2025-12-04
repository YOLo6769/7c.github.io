const mongoose = require('mongoose');

// Schemat wiadomości
const messageSchema = new mongoose.Schema({
  sender: String, // Anonimowy ID
  content: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);