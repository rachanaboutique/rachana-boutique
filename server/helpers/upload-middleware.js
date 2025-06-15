const { setCorsHeaders } = require('./cors-helper');

// Middleware to handle upload-specific requirements
const uploadMiddleware = (req, res, next) => {
  // Set CORS headers
  setCorsHeaders(req, res);
  
  // Set longer timeout for upload routes
  req.setTimeout(60000); // 60 seconds
  res.setTimeout(60000);
  
  // Add upload-specific headers
  res.header('Cache-Control', 'no-cache');
  
  next();
};

// Error handler for upload routes
const uploadErrorHandler = (err, req, res, next) => {
  setCorsHeaders(req, res);
  
  console.error('Upload error:', err);
  
  // Handle different types of errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files'
    });
  }
  
  if (err.message && err.message.includes('timeout')) {
    return res.status(408).json({
      success: false,
      message: 'Upload timeout - file processing took too long'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Upload failed',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  uploadMiddleware,
  uploadErrorHandler
};