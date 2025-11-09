const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  uploader: {
    type: String,
    required: true,
    enum: ['A1', 'D1', 'D2', 'R1']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  size: {
    type: Number
  }
});

module.exports = mongoose.model('Document', DocumentSchema);