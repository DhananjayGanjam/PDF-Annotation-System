  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  const app = express();

  // Middleware Code
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-id']
  }));
  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  // MongoDB Connection Code
  mongoose.connect('mongodb://localhost:27017/pdf-annotator', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  //Code To Create Uploads Directory If It Doesn't Exist
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }

  // Routes
  app.use('/api/documents', require('./routes/DocumentsUpload'));
  app.use('/api/annotations', require('./routes/CreateAnnotation'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));