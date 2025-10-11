const Document = require('../models/Document');
const { uploadDocumentToCloudinary } = require('../middleware/documentUpload');

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

    // Create document record
    const document = new Document({
      user: userId,
      title,
      category,
      description: description || '',
      date: new Date(date),
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

    // TODO: Delete file from Cloudinary
    // For now, just delete the database record
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
