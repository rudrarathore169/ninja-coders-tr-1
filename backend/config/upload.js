import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from './config.js';

/**
 * File Upload Configuration for Menu Images
 */

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const directories = [
    'uploads',
    'uploads/images',
    'uploads/images/menu',
    'uploads/images/categories'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this function to ensure directories exist
ensureUploadDirectories();

/**
 * Configure multer storage for menu images
 */
export const menuImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/images/menu/';
    
    // Create subdirectory based on current date for organization
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    uploadPath += `${year}/${month}/${day}/`;
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `menu-item-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

/**
 * Configure multer storage for category images
 */
export const categoryImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/images/categories/';
    
    // Create subdirectory based on current date for organization
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    uploadPath += `${year}/${month}/${day}/`;
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `category-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

/**
 * File filter for menu images
 */
export const menuImageFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Check for specific image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
    }
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

/**
 * Configure multer for menu item images
 */
export const uploadMenuItemImage = multer({
  storage: menuImageStorage,
  fileFilter: menuImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

/**
 * Configure multer for category images
 */
export const uploadCategoryImage = multer({
  storage: categoryImageStorage,
  fileFilter: menuImageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit for categories
    files: 1 // Only one file at a time
  }
});

/**
 * Middleware to handle file upload errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB for menu items and 3MB for categories.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one image is allowed per upload.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please use the correct field name.'
      });
    }
  }
  
  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

/**
 * Get file URL from file path
 */
export const getFileUrl = (filePath, baseUrl = 'http://localhost:5000') => {
  if (!filePath) return null;
  
  // Convert backslashes to forward slashes for URLs
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Remove 'uploads/' prefix if it exists
  const urlPath = normalizedPath.startsWith('uploads/') 
    ? normalizedPath.substring(8) 
    : normalizedPath;
  
  return `${baseUrl}/uploads/${urlPath}`;
};

/**
 * Delete file from filesystem
 */
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      resolve();
      return;
    }
    
    fs.unlink(filePath, (err) => {
      if (err) {
        // Don't reject if file doesn't exist
        if (err.code === 'ENOENT') {
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
};

export default {
  uploadMenuItemImage,
  uploadCategoryImage,
  handleUploadError,
  getFileUrl,
  deleteFile
};