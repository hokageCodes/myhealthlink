const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: [true, 'Reminder type is required'],
    enum: ['medication', 'health-check', 'appointment', 'vaccination', 'lab-test', 'custom']
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
  frequency: {
    type: String,
    required: true,
    enum: ['once', 'daily', 'weekly', 'monthly', 'custom']
  },
  medicationName: String,
  dosage: String,
  timesPerDay: Number,
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6
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
  scheduledFor: Date,
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  nextTrigger: Date,
  completedDates: [Date],
  missedDates: [Date],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  relatedMedicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication'
  },
  relatedAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  relatedDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ user: 1, isActive: 1 });
reminderSchema.index({ user: 1, nextTrigger: 1 });

// Method to calculate next trigger time
reminderSchema.methods.calculateNextTrigger = function() {
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
      if (this.timeOfDay && this.timeOfDay.length > 0) {
        const nextTime = this.getNextCustomTime();
        this.nextTrigger = nextTime;
      }
      break;
  }
  
  return this;
};

// Helper method for custom time calculation
reminderSchema.methods.getNextCustomTime = function() {
  if (!this.timeOfDay || this.timeOfDay.length === 0) {
    return new Date();
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find next time today or tomorrow
  for (const time of this.timeOfDay) {
    const reminderTime = time.hour * 60 + time.minute;
    if (reminderTime > currentTime) {
      const next = new Date(now);
      next.setHours(time.hour, time.minute, 0, 0);
      return next;
    }
  }

  // If no time found today, use first time tomorrow
  const firstTime = this.timeOfDay[0];
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(firstTime.hour, firstTime.minute, 0, 0);
  return next;
};

// Method to mark as completed
reminderSchema.methods.markCompleted = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.completedDates.some(d => d.getTime() === today.getTime())) {
    this.completedDates.push(today);
    this.missedDates = this.missedDates.filter(date => 
      date.getTime() !== today.getTime()
    );
  }
  
  this.lastTriggered = new Date();
  this.calculateNextTrigger();
  return this;
};

// Method to mark as missed
reminderSchema.methods.markMissed = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.missedDates.some(d => d.getTime() === today.getTime())) {
    this.missedDates.push(today);
  }
  
  this.lastTriggered = new Date();
  this.calculateNextTrigger();
  return this;
};

module.exports = mongoose.model('Reminder', reminderSchema);

