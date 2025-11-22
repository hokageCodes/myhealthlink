const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure user has a username
    if (!user.username) {
      let username = User.generateUsername(user.name);
      let usernameExists = await User.findOne({ username });
      while (usernameExists) {
        username = User.generateUsername(user.name);
        usernameExists = await User.findOne({ username });
      }
      user.username = username;
      await user.save();
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
    const { 
      name, phone, dateOfBirth, gender, bloodType, genotype, allergies, chronicConditions,
      emergencyContact, additionalContacts, isPublicProfile, publicFields,
      shareLinkSettings, profilePicture 
    } = req.body;

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
    if (genotype !== undefined) user.genotype = genotype === '' ? null : genotype;
    if (allergies !== undefined) user.allergies = allergies === '' ? null : allergies;
    if (chronicConditions !== undefined) user.chronicConditions = chronicConditions === '' ? null : chronicConditions;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (emergencyContact !== undefined) {
      user.emergencyContact = {
        name: emergencyContact.name === '' ? null : emergencyContact.name,
        phone: emergencyContact.phone === '' ? null : emergencyContact.phone,
        email: emergencyContact.email === '' ? null : emergencyContact.email,
        relationship: emergencyContact.relationship === '' ? null : emergencyContact.relationship,
        linkedUsername: emergencyContact.linkedUsername === '' ? null : emergencyContact.linkedUsername,
      };
    }
    if (additionalContacts !== undefined) {
      user.additionalContacts = additionalContacts;
    }
    if (isPublicProfile !== undefined) user.isPublicProfile = isPublicProfile;
    if (publicFields !== undefined) user.publicFields = publicFields;

    // Update share link settings
    if (shareLinkSettings !== undefined) {
      if (!user.shareLinkSettings) {
        user.shareLinkSettings = {};
      }

      if (shareLinkSettings.accessType !== undefined) {
        user.shareLinkSettings.accessType = shareLinkSettings.accessType;
      }

      // Hash password if provided
      if (shareLinkSettings.password !== undefined) {
        if (shareLinkSettings.password === '' || shareLinkSettings.password === null) {
          // Remove password
          user.shareLinkSettings.password = undefined;
        } else {
          // Hash new password
          const salt = await bcrypt.genSalt(10);
          user.shareLinkSettings.password = await bcrypt.hash(shareLinkSettings.password, salt);
        }
      }

      if (shareLinkSettings.expiresAt !== undefined) {
        user.shareLinkSettings.expiresAt = shareLinkSettings.expiresAt ? new Date(shareLinkSettings.expiresAt) : null;
      }

      // Clear access tokens when changing settings
      if (shareLinkSettings.accessType !== undefined || shareLinkSettings.password !== undefined) {
        user.shareLinkSettings.accessToken = undefined;
        user.shareLinkSettings.accessTokenExpires = undefined;
      }
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(req.user.userId).select('-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens -shareLinkSettings.password');

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

// @desc    Search users by username (for linking emergency contacts)
// @route   GET /api/profile/search/:username
// @access  Private
const searchByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Only search if username is provided and at least 3 characters
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters' 
      });
    }

    // Search for users with matching username (case-insensitive)
    const users = await User.find({ 
      username: { $regex: username, $options: 'i' },
      _id: { $ne: req.user.userId } // Exclude current user
    })
    .select('username name profilePicture')
    .limit(5) // Limit results
    .lean();

    res.status(200).json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  searchByUsername,
};
