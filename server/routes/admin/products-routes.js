const express = require("express");

const {
  handleImageUpload,
  handleVideoUpload,
  addProduct,
  editProduct,
  fetchAllProducts, 
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// Middleware to handle CORS for file uploads specifically
const handleFileUploadCors = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173", 
    "https://rachana-boutique-chennai.web.app", 
    "https://rachanaboutique.in",
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Expires, Pragma, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
};

// Apply CORS middleware to all routes
router.use(handleFileUploadCors);

//allow single or multiple file upload
router.post("/upload-image", upload.array("my_file"), handleImageUpload);
router.post("/upload-video", upload.single("my_file"), handleVideoUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

module.exports = router;
