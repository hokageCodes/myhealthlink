const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helper function to check access token
const verifyAccessToken = (user, token) => {
  if (!user.shareLinkSettings?.accessToken || !user.shareLinkSettings?.accessTokenExpires) {
    return false;
  }
  if (new Date() > user.shareLinkSettings.accessTokenExpires) {
    return false;
  }
  return user.shareLinkSettings.accessToken === token;
};

// Helper function to generate access token
const generateAccessToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @desc    Get public profile by username
// @route   GET /api/public/profile/:username
// @access  Public
const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { token } = req.query; // Access token from query parameter

    // Find user by username
    const user = await User.findOne({ username }).select(
      '-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens -email -shareLinkSettings.password'
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }

    // Check if user has enabled public sharing
    if (!user.isPublicProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile is not public' 
      });
    }

    // Check link expiry
    if (user.shareLinkSettings?.expiresAt && new Date() > user.shareLinkSettings.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        message: 'This share link has expired' 
      });
    }

    // Check access type
    const accessType = user.shareLinkSettings?.accessType || 'public';
    
    if (accessType === 'none') {
      return res.status(403).json({ 
        success: false, 
        message: 'Profile sharing is disabled' 
      });
    }

    // If password or OTP protected, verify token
    if ((accessType === 'password' || accessType === 'otp') && !token) {
      return res.status(401).json({ 
        success: false, 
        requiresAuth: true,
        accessType: accessType,
        message: accessType === 'password' ? 'Password required' : 'OTP verification required'
      });
    }

    if (accessType === 'password' || accessType === 'otp') {
      const fullUser = await User.findById(user._id).select('shareLinkSettings');
      if (!verifyAccessToken(fullUser, token)) {
        return res.status(401).json({ 
          success: false, 
          requiresAuth: true,
          accessType: accessType,
          message: accessType === 'password' ? 'Invalid or expired password token' : 'Invalid or expired OTP token'
        });
      }
    }

    // Check if this is emergency mode access
    const isEmergencyMode = req.query.emergency === 'true' || req.query.mode === 'emergency';
    
    // Return only the data the user wants to share publicly
    let publicData = {
      name: user.name,
      profilePicture: user.profilePicture,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
    };

    if (isEmergencyMode) {
      // Emergency mode: Show only critical fields
      const emergencyFields = user.emergencyMode?.criticalFields || [
        'bloodType',
        'allergies',
        'emergencyContact',
        'chronicConditions'
      ];
      
      if (emergencyFields.includes('bloodType')) {
        publicData.bloodType = user.bloodType;
      }
      if (emergencyFields.includes('allergies')) {
        publicData.allergies = user.allergies;
      }
      if (emergencyFields.includes('emergencyContact')) {
        publicData.emergencyContact = user.emergencyContact;
      }
      if (emergencyFields.includes('chronicConditions')) {
        publicData.chronicConditions = user.chronicConditions;
      }
      
      publicData.emergencyMode = true;
    } else {
      // Normal public mode: Use publicFields
      publicData.bloodType = user.publicFields?.includes('bloodType') ? user.bloodType : null;
      publicData.allergies = user.publicFields?.includes('allergies') ? user.allergies : null;
      publicData.emergencyContact = user.publicFields?.includes('emergencyContact') ? user.emergencyContact : null;
    }

    res.status(200).json({ 
      success: true, 
      data: publicData 
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Verify share link password
// @route   POST /api/public/profile/:username/verify-password
// @access  Public
const verifySharePassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findOne({ username }).select('shareLinkSettings');

    if (!user || !user.isPublicProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if password protection is enabled
    if (user.shareLinkSettings?.accessType !== 'password') {
      return res.status(400).json({
        success: false,
        message: 'Password protection is not enabled for this profile'
      });
    }

    // Check expiry
    if (user.shareLinkSettings?.expiresAt && new Date() > user.shareLinkSettings.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This share link has expired'
      });
    }

    // Verify password
    if (!user.shareLinkSettings?.password) {
      return res.status(500).json({
        success: false,
        message: 'Password not configured'
      });
    }

    const isMatch = await bcrypt.compare(password, user.shareLinkSettings.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Generate access token (valid for 24 hours)
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    user.shareLinkSettings.accessToken = accessToken;
    user.shareLinkSettings.accessTokenExpires = tokenExpires;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password verified',
      token: accessToken,
      expiresAt: tokenExpires
    });
  } catch (error) {
    console.error('Error verifying share password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Request OTP for share link
// @route   POST /api/public/profile/:username/request-otp
// @access  Public
const requestShareOTP = async (req, res) => {
  try {
    const { username } = req.params;
    const { email } = req.body; // Optional: email to send OTP to

    const user = await User.findOne({ username }).select('shareLinkSettings email name');

    if (!user || !user.isPublicProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if OTP protection is enabled
    if (user.shareLinkSettings?.accessType !== 'otp') {
      return res.status(400).json({
        success: false,
        message: 'OTP protection is not enabled for this profile'
      });
    }

    // Check expiry
    if (user.shareLinkSettings?.expiresAt && new Date() > user.shareLinkSettings.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This share link has expired'
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // Valid for 10 minutes

    user.shareLinkSettings.shareOTP = otp;
    user.shareLinkSettings.shareOTPExpires = otpExpires;
    await user.save();

    // TODO: Send OTP via email/SMS
    // For now, we'll return it (in production, don't return OTP)
    // Only return in development
    const returnOTP = process.env.NODE_ENV !== 'production';

    res.status(200).json({
      success: true,
      message: returnOTP ? `OTP sent (development mode): ${otp}` : 'OTP sent to your email',
      ...(returnOTP && { otp }) // Only return OTP in development
    });
  } catch (error) {
    console.error('Error requesting share OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify share link OTP
// @route   POST /api/public/profile/:username/verify-otp
// @access  Public
const verifyShareOTP = async (req, res) => {
  try {
    const { username } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const user = await User.findOne({ username }).select('shareLinkSettings');

    if (!user || !user.isPublicProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if OTP protection is enabled
    if (user.shareLinkSettings?.accessType !== 'otp') {
      return res.status(400).json({
        success: false,
        message: 'OTP protection is not enabled for this profile'
      });
    }

    // Check expiry
    if (user.shareLinkSettings?.expiresAt && new Date() > user.shareLinkSettings.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This share link has expired'
      });
    }

    // Verify OTP
    if (!user.shareLinkSettings?.shareOTP || !user.shareLinkSettings?.shareOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.'
      });
    }

    if (new Date() > user.shareLinkSettings.shareOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (user.shareLinkSettings.shareOTP !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Generate access token (valid for 24 hours)
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    user.shareLinkSettings.accessToken = accessToken;
    user.shareLinkSettings.accessTokenExpires = tokenExpires;
    user.shareLinkSettings.shareOTP = undefined; // Clear OTP after use
    user.shareLinkSettings.shareOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified',
      token: accessToken,
      expiresAt: tokenExpires
    });
  } catch (error) {
    console.error('Error verifying share OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPublicProfile,
  verifySharePassword,
  requestShareOTP,
  verifyShareOTP
};
