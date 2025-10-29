const express = require('express');
const { 
  getPublicProfile,
  verifySharePassword,
  requestShareOTP,
  verifyShareOTP
} = require('../controllers/publicController');
const { getEmergencyProfile } = require('../controllers/emergencyController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/profile/:username', getPublicProfile);
router.post('/profile/:username/verify-password', verifySharePassword);
router.post('/profile/:username/request-otp', requestShareOTP);
router.post('/profile/:username/verify-otp', verifyShareOTP);

// Emergency access route (public but requires token)
router.get('/emergency/:username', getEmergencyProfile);

module.exports = router;
