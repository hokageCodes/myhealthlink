const express = require('express');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/documentUpload');
const { 
  getDocuments, 
  getDocument, 
  uploadDocument, 
  updateDocument, 
  deleteDocument, 
  downloadDocument, 
  getCategories 
} = require('../controllers/documentController');

const router = express.Router();

// All document routes require authentication
router.use(authenticate);

// Document routes
router.get('/', getDocuments);
router.get('/categories', getCategories);
router.get('/:id', getDocument);
router.post('/', upload.single('file'), uploadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);

module.exports = router;
