const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification Type
  type: {
    type: String,
    required: true,
    enum: [
      'reminder',
      'appointment',
      'medication',
      'document',
      'system',
      'alert',
      'emergency'
    ]
  },
  
  // Notification Content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Optional data for action/link
  actionUrl: {
    type: String,
    trim: true
  },
  
  actionLabel: {
    type: String,
    trim: true,
    maxlength: [50, 'Action label cannot exceed 50 characters']
  },
  
  // Related entities
  relatedEntity: {
    id: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['Reminder', 'Appointment', 'Medication', 'Document', 'EmergencyEvent']
    }
  },
  
  // Notification Status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: {
    type: Date
  },
  
  // Notification Channels (which channels were used)
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // Delivery Status
  emailSent: {
    type: Boolean,
    default: false
  },
  
  emailSentAt: {
    type: Date
  },
  
  smsSent: {
    type: Boolean,
    default: false
  },
  
  smsSentAt: {
    type: Date
  },
  
  pushSent: {
    type: Boolean,
    default: false
  },
  
  pushSentAt: {
    type: Date
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Icon and color for UI
  icon: {
    type: String
  },
  
  color: {
    type: String,
    enum: ['blue', 'green', 'purple', 'red', 'orange', 'gray'],
    default: 'blue'
  },
  
  // Expiry (optional - for time-sensitive notifications)
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, read: false });
};

// Static method to get recent notifications
notificationSchema.statics.getRecent = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('relatedEntity.id', 'title name');
};

module.exports = mongoose.model('Notification', notificationSchema);

