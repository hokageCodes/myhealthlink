const Document = require('../models/Document');
const { uploadDocumentToCloudinary } = require('../middleware/documentUpload');

// Document auto-categorization based on filename keywords
const categorizeDocument = (filename, description = '') => {
  const text = (filename + ' ' + description).toLowerCase();
  
  // Lab results keywords
  if (
    text.includes('lab') || text.includes('laboratory') || text.includes('test result') ||
    text.includes('blood test') || text.includes('cbc') || text.includes('lipid') ||
    text.includes('glucose') || text.includes('hba1c') || text.includes('cholesterol') ||
    text.includes('urine') || text.includes('stool') || text.includes('culture')
  ) {
    return 'lab-results';
  }
  
  // Prescription keywords
  if (
    text.includes('prescription') || text.includes('rx') || text.includes('prescribed') ||
    text.includes('medication') || text.includes('pharmacy') || text.includes('dispense')
  ) {
    return 'prescriptions';
  }
  
  // Medical images keywords
  if (
    text.includes('x-ray') || text.includes('xray') || text.includes('ct scan') ||
    text.includes('mri') || text.includes('ultrasound') || text.includes('scan') ||
    text.includes('image') || text.includes('radiology') || text.includes('ecg') ||
    text.includes('ekg') || text.includes('echocardiogram')
  ) {
    return 'imaging';
  }
  
  // Vaccination keywords
  if (
    text.includes('vaccine') || text.includes('vaccination') || text.includes('immunization') ||
    text.includes('inoculation') || text.includes('covid') || text.includes('flu shot')
  ) {
    return 'vaccination';
  }
  
  // Insurance keywords
  if (
    text.includes('insurance') || text.includes('claim') || text.includes('policy') ||
    text.includes('coverage') || text.includes('benefit') || text.includes('copay')
  ) {
    return 'insurance';
  }
  
  // Medical notes keywords
  if (
    text.includes('note') || text.includes('summary') || text.includes('report') ||
    text.includes('consultation') || text.includes('discharge') || text.includes('progress') ||
    text.includes('assessment') || text.includes('diagnosis')
  ) {
    return 'medical-reports';
  }
  
  // Default to 'other'
  return 'other';
};

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const { category, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { user: userId };
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get documents with pagination
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      data: documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    const { category, title, description, date } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadDocumentToCloudinary(req.file);

    // Auto-categorize if category not provided
    const finalCategory = category || categorizeDocument(req.file.originalname, description || '');

    // Create document record
    const document = new Document({
      user: userId,
      title: title || req.file.originalname,
      category: finalCategory,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      originalName: req.file.originalname,
      fileName: result.public_id,
      fileUrl: result.secure_url,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
  try {
    const { title, category, description, date } = req.body;
    const userId = req.user.userId;

    const document = await Document.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Update fields
    if (title !== undefined) document.title = title;
    if (category !== undefined) document.category = category;
    if (description !== undefined) document.description = description;
    if (date !== undefined) document.date = new Date(date);

    await document.save();

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete file from Cloudinary if fileName exists
    if (document.fileName) {
      try {
        const cloudinary = require('../utils/cloudinary');
        // Extract public_id from fileName (could be just the ID or full path)
        const publicId = document.fileName.includes('/') 
          ? document.fileName 
          : `myhealthlink/documents/${document.fileName}`;
        
        await cloudinary.uploader.destroy(publicId, {
          resource_type: 'auto' // Handles both images and PDFs
        });
        console.log(`Deleted file from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        // Log error but continue with database deletion
        // File might already be deleted or not found
        console.warn('Error deleting from Cloudinary (continuing anyway):', cloudinaryError.message);
      }
    }

    // Delete database record
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Redirect to Cloudinary URL for download
    res.redirect(document.fileUrl);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get document categories
// @route   GET /api/documents/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get unique categories for the user
    const categories = await Document.distinct('category', { user: userId });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getCategories
};
