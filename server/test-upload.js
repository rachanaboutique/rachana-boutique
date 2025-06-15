// Simple test script to validate upload functionality
const express = require('express');
const multer = require('multer');
const { setCorsHeaders } = require('./helpers/cors-helper');

const app = express();

// Simple in-memory storage for testing
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

app.use((req, res, next) => {
  setCorsHeaders(req, res);
  next();
});

app.post('/test-upload', upload.single('test_file'), (req, res) => {
  console.log('Test upload received:', {
    filename: req.file?.originalname,
    size: req.file?.size,
    mimetype: req.file?.mimetype
  });

  res.json({
    success: true,
    message: 'Test upload successful',
    file: {
      originalname: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    }
  });
});

if (require.main === module) {
  const port = process.env.TEST_PORT || 5001;
  app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
  });
}

module.exports = app;