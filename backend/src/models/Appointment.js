const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Appointment title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  provider: {
    type: String,
    required: [true, 'Provider is required'],
    trim: true,
    maxlength: [200, 'Provider name cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: ['consultation', 'follow-up', 'checkup', 'emergency'],
      message: 'Invalid appointment type'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [500, 'Location cannot exceed 500 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'confirmed', 'completed', 'cancelled'],
      message: 'Invalid appointment status'
    },
    default: 'pending'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ user: 1, date: -1 });
appointmentSchema.index({ user: 1, status: 1 });
appointmentSchema.index({ user: 1, date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

