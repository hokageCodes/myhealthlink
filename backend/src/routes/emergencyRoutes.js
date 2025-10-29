const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  triggerSOS,
  getEmergencyEvents,
  resolveEmergencyEvent
} = require('../controllers/emergencyController');

const router = express.Router();

// Protected routes (require authentication)
router.post('/sos', authenticate, triggerSOS);
router.get('/events', authenticate, getEmergencyEvents);
router.patch('/events/:id/resolve', authenticate, resolveEmergencyEvent);

module.exports = router;

