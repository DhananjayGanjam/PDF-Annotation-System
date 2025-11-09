const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const { checkPermission } = require('../middleware/RolBasAcc');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

//Code For Upload single document
router.post('/upload', checkPermission('upload'), upload.single('pdf'), async (req, res) => {
  try {
    const document = new Document({
      name: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      uploader: req.user.id,
      size: req.file.size
    });

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Code For Upload multiple documents
router.post('/upload-multiple', checkPermission('upload'), upload.array('pdfs', 10), async (req, res) => {
  try {
    const documents = await Promise.all(
      req.files.map(file => {
        const doc = new Document({
          name: file.originalname,
          filename: file.filename,
          filepath: file.path,
          uploader: req.user.id,
          size: file.size
        });
        return doc.save();
      })
    );

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Code To Get All Documents
router.get('/', checkPermission('view'), async (req, res) => {
  try {
    const documents = await Document.find().sort({ uploadDate: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE route MUST come before GET /:id routes
//Code To Delete Document
router.delete('/:id', checkPermission('upload'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete the file from uploads folder
    const filePath = path.resolve(document.filepath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Code To Get Single Document
router.get('/:id', checkPermission('view'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Code To Download Document
router.get('/:id/download', checkPermission('view'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filepath = path.resolve(document.filepath);
    res.download(filepath, document.name);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;