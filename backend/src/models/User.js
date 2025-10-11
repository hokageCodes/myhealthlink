const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Medical information
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  allergies: {
    type: String,
    maxlength: [500, 'Allergies description cannot exceed 500 characters']
  },
  
  // Emergency contact
  emergencyContact: {
    name: {
      type: String,
      maxlength: [50, 'Emergency contact name cannot exceed 50 characters']
    },
    phone: {
      type: String
    },
    relationship: {
      type: String,
      maxlength: [30, 'Relationship cannot exceed 30 characters']
    }
  },
  
  // Profile picture
  profilePicture: {
    type: String
  },
  
  // Public sharing settings
  isPublicProfile: {
    type: Boolean,
    default: false
  },
  publicFields: [{
    type: String,
    enum: ['bloodType', 'allergies', 'emergencyContact', 'medications', 'healthMetrics']
  }],
  
  // Verification status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Email verification
  emailOTP: String,
  emailOTPExpires: Date,
  
  // Password reset
  resetToken: String,
  resetTokenExpires: Date,
  
  // Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Profile
  profileCompletion: {
    type: Number,
    default: 0
  },
  shareableLink: String,
  
  // Timestamps
  lastLogin: Date,
  refreshTokens: [String]
}, {
  timestamps: true
});

// REMOVED DUPLICATE INDEXES - unique: true already creates indexes
// userSchema.index({ email: 1 });     // ← REMOVED
// userSchema.index({ phone: 1 });     // ← REMOVED
// userSchema.index({ username: 1 });  // ← REMOVED

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static methods
userSchema.statics.generateUsername = function(name) {
  const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${baseName}${randomNum}`;
};

userSchema.statics.formatPhoneNumber = function(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle Nigerian phone numbers
  if (digits.startsWith('234')) {
    return `+${digits}`;
  } else if (digits.startsWith('0')) {
    return `+234${digits.substring(1)}`;
  } else if (digits.length === 10) {
    return `+234${digits}`;
  }
  
  return phone; // Return original if can't format
};

// Transform JSON output
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.emailOTP;
    delete ret.emailOTPExpires;
    delete ret.resetToken;
    delete ret.resetTokenExpires;
    delete ret.refreshTokens;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);