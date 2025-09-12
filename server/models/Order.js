const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
      productCode: String,
      colors: {
        _id: String,
        title: String,
        image: String,
      }
    },
  ],
  addressInfo: {
    addressId: String,
    name: String,
    address: String,
    state: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  payerId: String,
  trackingNumber: String,
});

module.exports = mongoose.model("Order", OrderSchema);
