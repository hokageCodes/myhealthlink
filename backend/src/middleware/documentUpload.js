const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Check file type - allow PDF and images
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
    }
  }
});

// Function to upload document to Cloudinary
const uploadDocumentToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'myhealthlink/documents',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

module.exports = { upload, uploadDocumentToCloudinary };
