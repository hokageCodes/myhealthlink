const express = require('express');
const { getPublicProfile } = require('../controllers/publicController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/profile/:username', getPublicProfile);

module.exports = router;
