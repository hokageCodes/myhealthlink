const User = require('../models/User');

// @desc    Get public profile by username
// @route   GET /api/public/profile/:username
// @access  Public
const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username
    const user = await User.findOne({ username }).select(
      '-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens -email'
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

    // Return only the data the user wants to share publicly
    const publicData = {
      name: user.name,
      profilePicture: user.profilePicture,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      bloodType: user.publicFields?.includes('bloodType') ? user.bloodType : null,
      allergies: user.publicFields?.includes('allergies') ? user.allergies : null,
      emergencyContact: user.publicFields?.includes('emergencyContact') ? user.emergencyContact : null,
      // Add more fields as needed
    };

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

module.exports = {
  getPublicProfile,
};
