import mongoose from 'mongoose';

const HealthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metric Information
  type: {
    type: String,
    required: [true, 'Metric type is required'],
    enum: [
      'blood-pressure',
      'weight',
      'blood-glucose',
      'heart-rate',
      'temperature',
      'medication-adherence',
      'custom'
    ]
  },
  
  // Metric Values
  value: {
    numeric: Number,
    text: String,
    unit: String
  },
  
  // For blood pressure
  systolic: Number,
  diastolic: Number,
  
  // For medication adherence
  medicationName: String,
  taken: Boolean,
  missedReason: String,
  
  // For custom metrics
  customType: String,
  customUnit: String,
  
  // Recording Information
  recordedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  recordedBy: {
    type: String,
    enum: ['user', 'doctor', 'device', 'imported'],
    default: 'user'
  },
  
  // Context and Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Location (if relevant)
  location: {
    type: String,
    enum: ['home', 'clinic', 'hospital', 'pharmacy', 'other']
  },
  
  // Tags for organization
  tags: [String],
  
  // Privacy Settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
HealthMetricSchema.index({ userId: 1, type: 1, recordedAt: -1 });
HealthMetricSchema.index({ userId: 1, recordedAt: -1 });
HealthMetricSchema.index({ userId: 1, status: 1 });

// Virtual for formatted value
HealthMetricSchema.virtual('formattedValue').get(function() {
  switch (this.type) {
    case 'blood-pressure':
      return `${this.systolic}/${this.diastolic} mmHg`;
    case 'weight':
      return `${this.value.numeric} ${this.value.unit || 'kg'}`;
    case 'blood-glucose':
      return `${this.value.numeric} ${this.value.unit || 'mg/dL'}`;
    case 'heart-rate':
      return `${this.value.numeric} bpm`;
    case 'temperature':
      return `${this.value.numeric}°${this.value.unit || 'C'}`;
    case 'medication-adherence':
      return this.taken ? 'Taken' : 'Missed';
    case 'custom':
      return `${this.value.numeric || this.value.text} ${this.value.unit || this.customUnit || ''}`;
    default:
      return this.value.numeric || this.value.text || 'N/A';
  }
});

// Virtual for status color (for UI)
HealthMetricSchema.virtual('statusColor').get(function() {
  switch (this.type) {
    case 'blood-pressure':
      if (this.systolic >= 140 || this.diastolic >= 90) return 'red';
      if (this.systolic >= 120 || this.diastolic >= 80) return 'yellow';
      return 'green';
    case 'blood-glucose':
      if (this.value.numeric >= 200) return 'red';
      if (this.value.numeric >= 140) return 'yellow';
      return 'green';
    case 'medication-adherence':
      return this.taken ? 'green' : 'red';
    default:
      return 'blue';
  }
});

// Static method to get latest metric of a type
HealthMetricSchema.statics.getLatest = function(userId, type) {
  return this.findOne({
    userId,
    type,
    status: 'active'
  }).sort({ recordedAt: -1 });
};

// Static method to get metrics for a date range
HealthMetricSchema.statics.getByDateRange = function(userId, type, startDate, endDate) {
  const query = {
    userId,
    status: 'active'
  };
  
  if (type) query.type = type;
  if (startDate || endDate) {
    query.recordedAt = {};
    if (startDate) query.recordedAt.$gte = startDate;
    if (endDate) query.recordedAt.$lte = endDate;
  }
  
  return this.find(query).sort({ recordedAt: -1 });
};

// Static method to get trends
HealthMetricSchema.statics.getTrends = function(userId, type, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        type,
        status: 'active',
        recordedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' }
        },
        avgValue: { $avg: '$value.numeric' },
        count: { $sum: 1 },
        latest: { $last: '$$ROOT' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

export default mongoose.models.HealthMetric || mongoose.model('HealthMetric', HealthMetricSchema);
