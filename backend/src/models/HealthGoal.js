const mongoose = require('mongoose');

const healthGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [200, 'Goal title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'weight',
      'exercise',
      'medication',
      'blood-pressure',
      'blood-sugar',
      'cholesterol',
      'sleep',
      'hydration',
      'nutrition',
      'mental-health',
      'other'
    ]
  },
  targetValue: {
    type: Number,
    required: function() {
      // Required for numeric goals
      return ['weight', 'blood-pressure', 'blood-sugar', 'cholesterol', 'exercise', 'sleep', 'hydration'].includes(this.category);
    }
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: ''
  },
  targetDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    date: {
      type: Date,
      required: true
    },
    value: {
      type: Number
    },
    notes: {
      type: String,
      maxlength: [500, 'Milestone notes cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  }
}, {
  timestamps: true
});

// Indexes
healthGoalSchema.index({ user: 1, status: 1 });
healthGoalSchema.index({ user: 1, targetDate: -1 });
healthGoalSchema.index({ category: 1, status: 1 });

// Method to calculate progress
healthGoalSchema.methods.calculateProgress = function() {
  if (!this.targetValue || this.targetValue === 0) {
    this.progress = 0;
    return;
  }

  const progress = (this.currentValue / this.targetValue) * 100;
  this.progress = Math.min(100, Math.max(0, Math.round(progress)));
  
  // Auto-complete if progress >= 100%
  if (this.progress >= 100 && this.status === 'active') {
    this.status = 'completed';
  }
  
  return this.progress;
};

// Method to add milestone
healthGoalSchema.methods.addMilestone = function(value, notes = '') {
  this.milestones.push({
    date: new Date(),
    value: value || this.currentValue,
    notes
  });
  
  // Update current value if provided
  if (value !== undefined && value !== null) {
    this.currentValue = value;
    this.calculateProgress();
  }
  
  return this.save();
};

module.exports = mongoose.model('HealthGoal', healthGoalSchema);

