import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },

  // Medical Information
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  genotype: {
    type: String,
    enum: ['AA', 'AS', 'SS', 'AC', 'SC', 'CC', 'unknown'],
    default: 'unknown'
  },
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    notes: String
  }],
  chronicConditions: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'managed'],
      default: 'active'
    },
    notes: String
  }],

  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },

  // Current Medications
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: String,
    notes: String
  }],

  // Profile Settings
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  // Privacy Settings
  privacySettings: {
    shareProfile: {
      type: Boolean,
      default: true
    },
    requirePasscode: {
      type: Boolean,
      default: false
    },
    passcode: String,
    visibleFields: [String],
    hideFields: [String]
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  refreshTokens: [String],
  
  // Email Verification
  emailOTP: String,
  emailOTPExpires: Date,
  
  // Password Reset
  resetToken: String,
  resetTokenExpires: Date,

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Profile Link
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for shareable link
UserSchema.virtual('shareableLink').get(function() {
  return this.username ? `${process.env.NEXTAUTH_URL}/profile/${this.username}` : null;
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate profile completion
UserSchema.pre('save', function(next) {
  let completion = 0;
  const fields = [
    'name', 'email', 'phone', 'dateOfBirth', 'gender',
    'bloodType', 'genotype', 'emergencyContact.name', 'emergencyContact.phone'
  ];
  
  fields.forEach(field => {
    if (this.get(field)) {
      completion += 100 / fields.length;
    }
  });
  
  // Bonus points for additional info
  if (this.allergies && this.allergies.length > 0) completion += 5;
  if (this.chronicConditions && this.chronicConditions.length > 0) completion += 5;
  if (this.medications && this.medications.length > 0) completion += 5;
  
  this.profileCompletion = Math.min(Math.round(completion), 100);
  next();
});

// Method to check if account is locked
UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
