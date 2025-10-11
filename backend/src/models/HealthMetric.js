const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bloodPressure', 'weight', 'glucose', 'heartRate', 'temperature', 'oxygenSaturation', 'custom']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  // For blood pressure, value will be an object like {systolic: 120, diastolic: 80}
  // For other metrics, value will be a number
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthMetricSchema.index({ userId: 1, type: 1, date: -1 });
healthMetricSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
