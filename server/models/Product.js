const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: [String],
    title: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isNewArrival: Boolean,
    isFeatured: Boolean,
    isFastMoving: Boolean,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
