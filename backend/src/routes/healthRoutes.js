const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getHealthMetrics,
  addHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthSummary
} = require('../controllers/healthController');

const router = express.Router();

// All health routes require authentication
router.use(authenticate);

// Health metric routes
router.get('/metrics', getHealthMetrics);
router.post('/metrics', addHealthMetric);
router.put('/metrics/:id', updateHealthMetric);
router.delete('/metrics/:id', deleteHealthMetric);

// Health summary
router.get('/summary', getHealthSummary);

module.exports = router;
