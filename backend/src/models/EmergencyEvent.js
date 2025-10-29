const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['sos', 'auto-trigger', 'manual'],
    default: 'manual',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active',
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    },
    address: {
      type: String,
      trim: true
    },
    accuracy: Number // GPS accuracy in meters
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Emergency contact or responder
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Contacts notified
  contactsNotified: [{
    contact: {
      name: String,
      phone: String,
      relationship: String
    },
    notifiedAt: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['sms', 'email', 'whatsapp', 'push'],
      default: 'sms'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  // Temporary access link for hospitals/responders
  temporaryAccessToken: {
    type: String,
    required: false,
    index: true
  },
  temporaryAccessExpires: {
    type: Date,
    required: false
  },
  // Access tracking
  accessedBy: [{
    accessedAt: {
      type: Date,
      default: Date.now
    },
    accessorType: {
      type: String,
      enum: ['hospital', 'first-responder', 'contact', 'other']
    },
    identifier: String // Name, ID, or other identifier
  }]
}, {
  timestamps: true
});

// Indexes
emergencyEventSchema.index({ user: 1, status: 1 });
emergencyEventSchema.index({ temporaryAccessToken: 1 });
emergencyEventSchema.index({ triggeredAt: -1 });
emergencyEventSchema.index({ status: 1, triggeredAt: -1 });

// Method to generate temporary access token
emergencyEventSchema.methods.generateAccessToken = function() {
  const crypto = require('crypto');
  this.temporaryAccessToken = crypto.randomBytes(32).toString('hex');
  
  // Expires in 48 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);
  this.temporaryAccessExpires = expiresAt;
  
  return this.save();
};

// Method to mark as resolved
emergencyEventSchema.methods.resolve = function(resolvedBy, notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  if (resolvedBy) this.resolvedBy = resolvedBy;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to log access
emergencyEventSchema.methods.logAccess = function(accessorType, identifier) {
  this.accessedBy.push({
    accessedAt: new Date(),
    accessorType,
    identifier: identifier || 'Unknown'
  });
  return this.save();
};

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);

