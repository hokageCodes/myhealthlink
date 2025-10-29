const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  exportJSON,
  exportCSV
} = require('../controllers/exportController');

const router = express.Router();

// All export routes require authentication
router.use(authenticate);

// Export routes
router.get('/json', exportJSON);
router.get('/csv', exportCSV);

module.exports = router;

