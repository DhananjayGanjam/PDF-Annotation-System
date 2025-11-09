const express = require('express');
const router = express.Router();
const Annotation = require('../models/Annotations');
const { checkPermission, canEditAnnotation } = require('../middleware/RolBasAcc');

//Code To Create Annotation
router.post('/', checkPermission('annotate'), async (req, res) => {
  try {
    const { documentId, text, page, position, visibility, visibleTo } = req.body;

    const annotation = new Annotation({
      documentId,
      createdBy: req.user.id,
      text,
      page,
      position,
      visibility,
      visibleTo: visibility === 'specific' ? visibleTo : ['A1', 'D1', 'D2', 'R1']
    });

    await annotation.save();
    res.json(annotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Code To Get annotations for a document
router.get('/document/:documentId', checkPermission('view'), async (req, res) => {
  try {
    const annotations = await Annotation.find({ documentId: req.params.documentId });
    
    // Filter based on visibility and current user
    const visibleAnnotations = annotations.filter(ann => {
      if (ann.visibility === 'everyone') return true;
      if (ann.visibility === 'specific' && ann.visibleTo.includes(req.user.id)) return true;
      return false;
    });

    res.json(visibleAnnotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update annotation
router.put('/:id', checkPermission('annotate'), async (req, res) => {
  try {
    const annotation = await Annotation.findById(req.params.id);
    
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    if (!canEditAnnotation(annotation, req.user.id)) {
      return res.status(403).json({ error: 'Cannot edit this annotation' });
    }

    const { text, page, position, visibility, visibleTo } = req.body;
    
    annotation.text = text || annotation.text;
    annotation.page = page || annotation.page;
    annotation.position = position || annotation.position;
    annotation.visibility = visibility || annotation.visibility;
    annotation.visibleTo = visibleTo || annotation.visibleTo;
    annotation.updatedAt = Date.now();

    await annotation.save();
    res.json(annotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete annotation
router.delete('/:id', checkPermission('annotate'), async (req, res) => {
  try {
    const annotation = await Annotation.findById(req.params.id);
    
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    if (!canEditAnnotation(annotation, req.user.id)) {
      return res.status(403).json({ error: 'Cannot delete this annotation' });
    }

    await annotation.deleteOne();
    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;