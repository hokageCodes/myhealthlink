const User = require('../models/User');
const { 
  generateToken, 
  generateRefreshToken, 
  generateOTP, 
  generateResetToken,
  isValidEmail,
  isValidPhone 
} = require('../utils/auth');
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

// Register user
const register = async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, gender } = req.body;

    // Enhanced validation with field-specific errors
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
        field: 'name'
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'email'
      });
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Nigerian phone number',
        field: 'phone'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        field: 'password'
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required',
        field: 'dateOfBirth'
      });
    }

    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 13 years old to register',
        field: 'dateOfBirth'
      });
    }

    if (age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid date of birth',
        field: 'dateOfBirth'
      });
    }

    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid gender',
        field: 'gender'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: User.formatPhoneNumber(phone) }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists',
          field: 'email'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'An account with this phone number already exists',
          field: 'phone'
        });
      }
    }

    // Generate OTP for email verification
    const otp = generateOTP();

    // Send OTP via email FIRST
    try {
      await sendOTPEmail(email, otp, 'verification');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please check your email address and try again.'
      });
    }

    // Generate username
    let username = User.generateUsername(name);
    let usernameExists = await User.findOne({ username });
    while (usernameExists) {
      username = User.generateUsername(name);
      usernameExists = await User.findOne({ username });
    }

    // Create user with OTP
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone: User.formatPhoneNumber(phone),
      password,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      username,
      emailOTP: otp,
      emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      data: {
        userId: user._id,
        email: user.email,
        username: user.username,
        requiresVerification: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { emailOrPhone, password, rememberMe } = req.body;

    // Enhanced validation with field-specific errors
    if (!emailOrPhone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
        field: 'emailOrPhone'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        field: 'password'
      });
    }

    // Validate email/phone format
    const isEmail = isValidEmail(emailOrPhone);
    if (!isEmail && !User.formatPhoneNumber(emailOrPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email or phone number',
        field: 'emailOrPhone'
      });
    }

    // Find user by email or phone
    const query = isEmail 
      ? { email: emailOrPhone.toLowerCase() }
      : { phone: User.formatPhoneNumber(emailOrPhone) };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
        field: 'emailOrPhone'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your email for the verification code.',
        field: 'emailOrPhone'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
        field: 'password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      username: user.username
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);

    // Limit refresh tokens to 5
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Set refresh token cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          profileCompletion: user.profileCompletion,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        },
        accessToken,
        refreshToken // Include refresh token in response for mobile apps
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type = 'email' } = req.body;

    // Enhanced validation with field-specific errors
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        field: 'email'
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
        field: 'otp'
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code',
        field: 'otp'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already verified',
        field: 'email'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.emailOTP || !user.emailOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found or code has expired. Please request a new code.',
        field: 'otp'
      });
    }

    if (new Date() > user.emailOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
        field: 'otp'
      });
    }

    // Validate OTP
    if (user.emailOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
        field: 'otp'
      });
    }

    // Update verification status
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    // Generate tokens for immediate login
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      username: user.username
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);

    // Limit refresh tokens to 5
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          profileCompletion: user.profileCompletion,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        },
        accessToken,
        refreshToken // Include refresh token in response for mobile apps
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOTPEmail(email, otp, 'verification');

    res.json({
      success: true,
      message: 'Verification code sent successfully!'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Remove refresh token from user's tokens array
      await User.updateOne(
        { refreshTokens: refreshToken },
        { $pull: { refreshTokens: refreshToken } }
      );
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user and all associated data
    // Note: This uses Mongoose cascading deletes if configured
    await User.findByIdAndDelete(userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  logout,
  deleteAccount
};
