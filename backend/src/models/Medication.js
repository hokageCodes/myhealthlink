const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: [200, 'Medication name cannot exceed 200 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [100, 'Dosage cannot exceed 100 characters']
  },
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'liquid', 'injection', 'topical', 'other'],
    default: 'tablet'
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once', 'daily', 'twice-daily', 'three-times-daily', 'weekly', 'as-needed', 'other']
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  prescribedBy: {
    type: String,
    trim: true,
    maxlength: [200, 'Prescriber name cannot exceed 200 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'inactive', 'stopped'],
    default: 'active'
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderTimes: [{
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
  relatedReminderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  },
  // Adherence tracking
  adherenceLog: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String // "HH:MM" format
    },
    taken: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    loggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  missedDoses: [{
    date: {
      type: Date,
      required: true
    },
    scheduledTime: String,
    reason: String
  }]
}, {
  timestamps: true
});

// Indexes
medicationSchema.index({ user: 1, status: 1 });
medicationSchema.index({ user: 1, startDate: -1 });
medicationSchema.index({ 'adherenceLog.date': -1 });

// Method to calculate adherence percentage
medicationSchema.methods.calculateAdherence = function(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Calculate expected doses based on frequency
  let expectedDoses = 0;
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  switch (this.frequency) {
    case 'once':
      expectedDoses = daysDiff >= 30 ? 1 : 0;
      break;
    case 'daily':
      expectedDoses = daysDiff;
      break;
    case 'twice-daily':
      expectedDoses = daysDiff * 2;
      break;
    case 'three-times-daily':
      expectedDoses = daysDiff * 3;
      break;
    case 'weekly':
      expectedDoses = Math.ceil(daysDiff / 7);
      break;
    default:
      expectedDoses = daysDiff;
  }

  // Count actual taken doses
  const takenDoses = this.adherenceLog.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate && log.taken === true;
  }).length;

  // Count missed doses
  const missedDoses = this.missedDoses.filter(missed => {
    const missedDate = new Date(missed.date);
    return missedDate >= startDate && missedDate <= endDate;
  }).length;

  if (expectedDoses === 0) return 100;

  const adherence = ((takenDoses / expectedDoses) * 100).toFixed(1);
  return Math.min(100, parseFloat(adherence));
};

// Method to log medication intake
medicationSchema.methods.logIntake = function(taken = true, notes = '') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already logged for today
  const existingLog = this.adherenceLog.find(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  if (existingLog) {
    existingLog.taken = taken;
    existingLog.notes = notes;
    existingLog.loggedAt = new Date();
    if (taken) {
      existingLog.time = new Date().toTimeString().slice(0, 5); // "HH:MM"
    }
  } else {
    this.adherenceLog.push({
      date: today,
      time: taken ? new Date().toTimeString().slice(0, 5) : null,
      taken,
      notes,
      loggedAt: new Date()
    });
  }

  // Remove from missed if it was there
  this.missedDoses = this.missedDoses.filter(missed => {
    const missedDate = new Date(missed.date);
    missedDate.setHours(0, 0, 0, 0);
    return missedDate.getTime() !== today.getTime();
  });

  return this.save();
};

// Method to mark as missed
medicationSchema.methods.logMissed = function(date, scheduledTime, reason = '') {
  const missedDate = new Date(date);
  missedDate.setHours(0, 0, 0, 0);

  // Check if already in missed list
  const existingMissed = this.missedDoses.find(missed => {
    const missedLogDate = new Date(missed.date);
    missedLogDate.setHours(0, 0, 0, 0);
    return missedLogDate.getTime() === missedDate.getTime();
  });

  if (!existingMissed) {
    this.missedDoses.push({
      date: missedDate,
      scheduledTime: scheduledTime || null,
      reason
    });
  }

  return this.save();
};

module.exports = mongoose.model('Medication', medicationSchema);

