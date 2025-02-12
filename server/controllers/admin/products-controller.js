const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");


// Handles image upload for both single and multiple files
const handleImageUpload = async (req, res) => {
  try {
    let results = [];
    // Check if multiple files were uploaded
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = "data:" + file.mimetype + ";base64," + b64;
        const result = await imageUploadUtil(url);
        results.push(result);
      }
    } else if (req.file) { // Single file upload fallback
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const url = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await imageUploadUtil(url);
      results.push(result);
    }
    return res.json({
      success: true,
      result: results,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      isNewArrival,
      isFeatured,
      isFastMoving,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    // Ensure that image is an array; if not, convert it to one.
    const images = Array.isArray(image) ? image : [image];

    const newlyCreatedProduct = new Product({
      image: images,
      title,
      description,
      category,
      isNewArrival,
      isFeatured,
      isFastMoving,
      price,
      salePrice,
      totalStock,
      averageReview,
    });

    await newlyCreatedProduct.save();
    return res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    // Retrieve all products from the database
    const listOfProducts = await Product.find({});

    // For each product, calculate the average review using parallel processing
    const productsWithAverage = await Promise.all(
      listOfProducts.map(async (product) => {
        // Find all reviews for the product using its _id
        const reviews = await ProductReview.find({ productId: product._id });

        // Compute the average reviewValue; if no reviews, default to 0
        const averageReview = reviews.length
          ? reviews.reduce((acc, review) => acc + review.reviewValue, 0) / reviews.length
          : 0;

        // Return a plain object representation with the additional averageReview field
        return { ...product.toObject(), averageReview };
      })
    );

    // Send response with the enriched product list including the average reviews
    return res.status(200).json({
      success: true,
      data: productsWithAverage,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      isNewArrival,
      isFeatured,
      isFastMoving,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (typeof title !== "undefined") {
      findProduct.title = title;
    }
    if (typeof description !== "undefined") {
      findProduct.description = description;
    }
    if (typeof category !== "undefined") {
      findProduct.category = category;
    }
    if (req.body.hasOwnProperty("isNewArrival")) {
      findProduct.isNewArrival = isNewArrival;
    }
    if (req.body.hasOwnProperty("isFeatured")) {
      findProduct.isFeatured = isFeatured;
    }
    if (req.body.hasOwnProperty("isFastMoving")) {
      findProduct.isFastMoving = isFastMoving;
    }
    if (typeof price !== "undefined") {
      findProduct.price = price === "" ? 0 : price;
    }
    if (typeof salePrice !== "undefined") {
      findProduct.salePrice = salePrice === "" ? 0 : salePrice;
    }
    if (typeof totalStock !== "undefined") {
      findProduct.totalStock = totalStock;
    }
    if (typeof image !== "undefined") {
      // Force image to be an array if it's not already
      findProduct.image = Array.isArray(image) ? image : [image];
    }
    if (typeof averageReview !== "undefined") {
      findProduct.averageReview = averageReview;
    }

    await findProduct.save();
    return res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};