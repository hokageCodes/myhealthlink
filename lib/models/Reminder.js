import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reminder Information
  type: {
    type: String,
    required: [true, 'Reminder type is required'],
    enum: [
      'medication',
      'health-check',
      'appointment',
      'vaccination',
      'lab-test',
      'custom'
    ]
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Scheduling
  frequency: {
    type: String,
    required: true,
    enum: [
      'once',
      'daily',
      'weekly',
      'monthly',
      'custom'
    ]
  },
  
  // For medication reminders
  medicationName: String,
  dosage: String,
  timesPerDay: Number,
  
  // For recurring reminders
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  }],
  
  timeOfDay: [{
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    minute: {
      type: Number,
      min: 0,
      max: 59
    }
  }],
  
  // For one-time reminders
  scheduledFor: Date,
  
  // Notification Settings
  notifications: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // Reminder Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastTriggered: Date,
  nextTrigger: Date,
  
  // Completion Tracking
  completedDates: [Date],
  missedDates: [Date],
  
  // Priority and Tags
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  tags: [String],
  
  // Related Data
  relatedMedicationId: String,
  relatedAppointmentId: String,
  relatedDocumentId: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ReminderSchema.index({ userId: 1, isActive: 1 });
ReminderSchema.index({ userId: 1, nextTrigger: 1 });
ReminderSchema.index({ userId: 1, type: 1 });
ReminderSchema.index({ nextTrigger: 1 });

// Virtual for completion rate
ReminderSchema.virtual('completionRate').get(function() {
  const total = this.completedDates.length + this.missedDates.length;
  return total > 0 ? Math.round((this.completedDates.length / total) * 100) : 0;
});

// Virtual for next trigger formatted
ReminderSchema.virtual('nextTriggerFormatted').get(function() {
  if (!this.nextTrigger) return 'Not scheduled';
  return this.nextTrigger.toLocaleString();
});

// Method to mark as completed
ReminderSchema.methods.markCompleted = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.completedDates.includes(today)) {
    this.completedDates.push(today);
    // Remove from missed if it was there
    this.missedDates = this.missedDates.filter(date => 
      date.getTime() !== today.getTime()
    );
  }
  
  this.lastTriggered = new Date();
  return this.calculateNextTrigger();
};

// Method to mark as missed
ReminderSchema.methods.markMissed = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.missedDates.includes(today)) {
    this.missedDates.push(today);
  }
  
  this.lastTriggered = new Date();
  return this.calculateNextTrigger();
};

// Method to calculate next trigger time
ReminderSchema.methods.calculateNextTrigger = function() {
  if (!this.isActive) return this;
  
  const now = new Date();
  
  switch (this.frequency) {
    case 'once':
      if (this.scheduledFor && this.scheduledFor <= now) {
        this.isActive = false;
      }
      break;
      
    case 'daily':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.nextTrigger = tomorrow;
      break;
      
    case 'weekly':
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      this.nextTrigger = nextWeek;
      break;
      
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      this.nextTrigger = nextMonth;
      break;
      
    case 'custom':
      // For medication reminders with specific times
      if (this.timeOfDay && this.timeOfDay.length > 0) {
        const nextTime = this.getNextCustomTime();
        this.nextTrigger = nextTime;
      }
      break;
  }
  
  return this;
};

// Helper method for custom time calculation
ReminderSchema.methods.getNextCustomTime = function() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Find next time today or tomorrow
  for (const time of this.timeOfDay) {
    const scheduledTime = new Date(today);
    scheduledTime.setHours(time.hour, time.minute, 0, 0);
    
    if (scheduledTime > now) {
      return scheduledTime;
    }
  }
  
  // If no time today, schedule for tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const firstTime = this.timeOfDay[0];
  tomorrow.setHours(firstTime.hour, firstTime.minute, 0, 0);
  
  return tomorrow;
};

// Pre-save middleware to calculate next trigger
ReminderSchema.pre('save', function(next) {
  if (this.isActive && !this.nextTrigger) {
    this.calculateNextTrigger();
  }
  next();
});

// Static method to get active reminders for a user
ReminderSchema.statics.getActiveReminders = function(userId) {
  return this.find({
    userId,
    isActive: true
  }).sort({ nextTrigger: 1 });
};

// Static method to get reminders due now
ReminderSchema.statics.getDueReminders = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    nextTrigger: { $lte: now }
  });
};

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
