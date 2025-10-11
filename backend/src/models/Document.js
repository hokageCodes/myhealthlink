const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Document category is required'],
    enum: {
      values: [
        'lab-results',
        'prescriptions',
        'medical-reports',
        'insurance',
        'vaccination',
        'imaging',
        'other'
      ],
      message: 'Invalid document category'
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Document date is required'],
    default: Date.now
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, category: 1 });
documentSchema.index({ user: 1, title: 'text', description: 'text' });

// Virtual for file size in MB
documentSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / 1024 / 1024).toFixed(2);
});

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);

