const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  markCompleted,
  getUpcomingReminders
} = require('../controllers/reminderController');

const router = express.Router();

// All reminder routes require authentication
router.use(authenticate);

// Reminder routes
router.get('/', getReminders);
router.get('/upcoming', getUpcomingReminders);
router.get('/:id', getReminder);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.post('/:id/complete', markCompleted);

module.exports = router;

