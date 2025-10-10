const express = require('express');
const { register, login, verifyOTP, resendOTP, logout } = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logout);

module.exports = router;
