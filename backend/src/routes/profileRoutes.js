const express = require('express');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');

const router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-picture', upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
