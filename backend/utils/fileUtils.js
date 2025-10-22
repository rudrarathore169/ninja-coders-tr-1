import multer from 'multer';
import path from 'path';
import config from '../config/config.js';

/**
 * File Upload and Validation Utilities
 */

/**
 * Configure multer storage for file uploads
 */
export const configureMulterStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Set upload destination based on file type
      let uploadPath = 'uploads/';
      
      if (file.fieldname === 'image' || file.fieldname === 'avatar') {
        uploadPath += 'images/';
      } else if (file.fieldname === 'document') {
        uploadPath += 'documents/';
      } else {
        uploadPath += 'misc/';
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
      cb(null, filename);
    }
  });
};

/**
 * File filter for multer
 */
export const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'image' || file.fieldname === 'avatar') {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for this field'), false);
    }
  } else if (file.fieldname === 'document') {
    // Allow document files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed'), false);
    }
  } else {
    // Allow all files for other fields
    cb(null, true);
  }
};

/**
 * Configure multer for file uploads
 */
export const configureMulter = () => {
  return multer({
    storage: configureMulterStorage(),
    fileFilter: fileFilter,
    limits: {
      fileSize: config.FILE_UPLOAD.MAX_FILE_SIZE, // 5MB default
      files: 10 // Maximum 10 files per request
    }
  });
};

/**
 * Validate file type
 * @param {Object} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if file type is allowed
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Validate file size
 * @param {Object} file - File object
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} True if file size is within limit
 */
export const validateFileSize = (file, maxSize = config.FILE_UPLOAD.MAX_FILE_SIZE) => {
  return file.size <= maxSize;
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file MIME type from extension
 * @param {string} extension - File extension
 * @returns {string} MIME type
 */
export const getMimeTypeFromExtension = (extension) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Validate image file
 * @param {Object} file - File object
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!validateFileType(file, allowedTypes)) {
    result.isValid = false;
    result.errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }
  
  if (!validateFileSize(file, maxSize)) {
    result.isValid = false;
    result.errors.push('File size too large. Maximum size is 5MB.');
  }
  
  return result;
};

/**
 * Validate document file
 * @param {Object} file - File object
 * @returns {Object} Validation result
 */
export const validateDocumentFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!validateFileType(file, allowedTypes)) {
    result.isValid = false;
    result.errors.push('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
  }
  
  if (!validateFileSize(file, maxSize)) {
    result.isValid = false;
    result.errors.push('File size too large. Maximum size is 10MB.');
  }
  
  return result;
};

/**
 * Generate secure filename
 * @param {string} originalName - Original filename
 * @param {string} prefix - Prefix for the filename
 * @returns {string} Secure filename
 */
export const generateSecureFilename = (originalName, prefix = 'file') => {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  return `${prefix}-${timestamp}-${randomString}${extension}`;
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 * @param {Object} file - File object
 * @returns {boolean} True if file is an image
 */
export const isImageFile = (file) => {
  return file.mimetype.startsWith('image/');
};

/**
 * Check if file is a document
 * @param {Object} file - File object
 * @returns {boolean} True if file is a document
 */
export const isDocumentFile = (file) => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  return documentTypes.includes(file.mimetype);
};

/**
 * Get file upload configuration for different types
 * @param {string} type - File type ('image', 'document', 'general')
 * @returns {Object} Upload configuration
 */
export const getUploadConfig = (type = 'general') => {
  const configs = {
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      destination: 'uploads/images/'
    },
    document: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      destination: 'uploads/documents/'
    },
    general: {
      maxSize: config.FILE_UPLOAD.MAX_FILE_SIZE,
      allowedTypes: config.FILE_UPLOAD.ALLOWED_FILE_TYPES,
      destination: 'uploads/misc/'
    }
  };
  
  return configs[type] || configs.general;
};

export default {
  configureMulterStorage,
  configureMulter,
  validateFileType,
  validateFileSize,
  getFileExtension,
  getMimeTypeFromExtension,
  validateImageFile,
  validateDocumentFile,
  generateSecureFilename,
  formatFileSize,
  isImageFile,
  isDocumentFile,
  getUploadConfig
};