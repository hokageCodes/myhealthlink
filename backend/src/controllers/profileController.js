const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, bloodType, allergies, emergencyContact, isPublicProfile, publicFields } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (bloodType !== undefined) user.bloodType = bloodType === '' ? null : bloodType;
    if (allergies !== undefined) user.allergies = allergies === '' ? null : allergies;
    if (emergencyContact !== undefined) {
      user.emergencyContact = {
        name: emergencyContact.name === '' ? null : emergencyContact.name,
        phone: emergencyContact.phone === '' ? null : emergencyContact.phone,
        relationship: emergencyContact.relationship === '' ? null : emergencyContact.relationship,
      };
    }
    if (isPublicProfile !== undefined) user.isPublicProfile = isPublicProfile;
    if (publicFields !== undefined) user.publicFields = publicFields;

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(req.user.userId).select('-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens');

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { uploadToCloudinary } = require('../middleware/upload');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file);
    
    // Update user's profile picture in database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.profilePicture = result.secure_url;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: result.secure_url
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
};
