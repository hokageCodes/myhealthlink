const express = require('express');
const { register, login, verifyOTP, resendOTP, logout, deleteAccount } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logout);
router.delete('/account', authenticate, deleteAccount);

module.exports = router;
