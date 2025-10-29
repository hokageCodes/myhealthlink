import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Document Information
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'lab-results',
      'prescriptions',
      'medical-images',
      'medical-notes',
      'insurance-documents',
      'vaccination-records',
      'other'
    ]
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // File Information
  fileName: {
    type: String,
    required: true
  },
  
  originalFileName: {
    type: String,
    required: true
  },
  
  fileSize: {
    type: Number,
    required: true
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  fileUrl: {
    type: String,
    required: true
  },
  
  thumbnailUrl: {
    type: String
  },
  
  // Document Details
  documentDate: {
    type: Date,
    required: true
  },
  
  issuedBy: {
    name: String,
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'lab', 'pharmacy', 'other']
    },
    contact: String
  },
  
  // Tags for better organization
  tags: [String],
  
  // Privacy Settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // OCR Data (for future implementation)
  extractedText: String,
  isOcrProcessed: {
    type: Boolean,
    default: false
  },
  
  // Access Tracking
  accessCount: {
    type: Number,
    default: 0
  },
  
  lastAccessed: Date,
  
  // Document Status
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
DocumentSchema.index({ userId: 1, category: 1 });
DocumentSchema.index({ userId: 1, documentDate: -1 });
DocumentSchema.index({ userId: 1, status: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ createdAt: -1 });

// Virtual for file extension
DocumentSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop().toLowerCase();
});

// Virtual for formatted file size
DocumentSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to increment access count
DocumentSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

// Pre-save middleware to generate tags from category and title
DocumentSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('category')) {
    const titleWords = this.title.toLowerCase().split(' ').filter(word => word.length > 2);
    const categoryTag = this.category.replace('-', ' ');
    this.tags = [...new Set([categoryTag, ...titleWords])];
  }
  next();
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
