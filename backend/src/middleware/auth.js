const { verifyToken } = require('../utils/auth');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address to access this resource.'
      });
    }

    // FIXED: Add both user object and userId to request
    req.user = {
      userId: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      fullUser: user // Include full user object in case controllers need it
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return next();
    }
    
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (user) {
      req.user = {
        userId: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        fullUser: user
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};