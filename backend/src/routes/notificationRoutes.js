const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.get('/:id', getNotification);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

