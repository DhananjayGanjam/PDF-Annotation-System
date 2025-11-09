const mongoose = require('mongoose');

const AnnotationSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  createdBy: {
    type: String,
    required: true,
    enum: ['A1', 'D1', 'D2', 'R1']
  },
  text: {
    type: String,
    required: true
  },
  page: {
    type: Number,
    required: true
  },
  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  visibility: {
    type: String,
    enum: ['everyone', 'specific'],
    default: 'everyone'
  },
  visibleTo: [{
    type: String,
    enum: ['A1', 'D1', 'D2', 'R1']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Annotation', AnnotationSchema);