const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
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

    console.log(averageReview, "averageReview");

    const newlyCreatedProduct = new Product({
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
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
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

    // Update only if the property exists in the request body.
    if (typeof title !== 'undefined') {
      findProduct.title = title;
    }
    if (typeof description !== 'undefined') {
      findProduct.description = description;
    }
    if (typeof category !== 'undefined') {
      findProduct.category = category;
    }
    if (req.body.hasOwnProperty('isNewArrival')) {
      findProduct.isNewArrival = isNewArrival;
    }

    if(req.body.hasOwnProperty('isFeatured')) {
      findProduct.isFeatured = isFeatured;
    }

    if(req.body.hasOwnProperty('isFastMoving')) {
      findProduct.isFastMoving = isFastMoving;
    }
    // For price and salePrice, check for empty string explicitly.
    if (typeof price !== 'undefined') {
      findProduct.price = price === "" ? 0 : price;
    }
    if (typeof salePrice !== 'undefined') {
      findProduct.salePrice = salePrice === "" ? 0 : salePrice;
    }
    if (typeof totalStock !== 'undefined') {
      findProduct.totalStock = totalStock;
    }
    if (typeof image !== 'undefined') {
      findProduct.image = image;
    }
    if (typeof averageReview !== 'undefined') {
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

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
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
