const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments
} = require('../controllers/appointmentController');

const router = express.Router();

// All appointment routes require authentication
router.use(authenticate);

// Appointment routes
router.get('/', getAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;

