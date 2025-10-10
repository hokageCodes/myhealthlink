const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user documents
router.get('/', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        documents: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
});

module.exports = router;
