const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const sendEmail = require("../../helpers/send-email");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET, 
});

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      email,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`, // Custom receipt ID
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save the order details in the database
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: orderStatus || "pending", // Default to pending if not provided
      paymentMethod,
      paymentStatus: paymentStatus || "pending", // Default to pending if not provided
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId, // Initially null for Razorpay; updated on capture
      payerId, // Initially null for Razorpay; updated on capture
      razorpayOrderId: razorpayOrder.id, // Save Razorpay order ID
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: newlyCreatedOrder._id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Error while creating Razorpay order",
    });
  }
};

// Capture Razorpay Payment
const capturePayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    // Verify payment: find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update payment status and order status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;

    // Reduce the total stock for each product in the order
    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);
      product.totalStock -= item.quantity;
      await product.save();
    }

    await order.save();

    // Prepare immersive email message with detailed order information and an appealing UI.
    const message = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:0 auto;">
        <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
          <h2 style="color: #4CAF50; margin-bottom: 5px;">Order Confirmed!</h2>
          <p style="font-size: 16px; margin-top: 0;">Thank you for your purchase.</p>
        </div>
        <div style="padding: 20px;">
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment ID:</strong> ${order.paymentId}</p>
          ${order.cartItems && order.cartItems.length ? `
            <h4 style="margin-top: 20px;">Items Ordered</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;">Product</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;">Quantity</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.cartItems.map(item => (
                  `<tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">₹${item.price}</td>
                  </tr>`
                )).join('')}
              </tbody>
            </table>
          ` : ''}
          <div style="text-align: center; margin-top: 30px;">
           <a href="${process.env.FRONTEND_URL}/shop/account" style="display: inline-block; background-color: #4CAF50; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;"> View Your Order</a>
          </div>
        </div>
        <div style="background-color: #f7f7f7; padding: 10px; text-align: center; font-size: 12px; color: #777;">
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    // Determine the recipient email using order.email or fallback to the user's profile.
    const recipientEmail = order.email || (await User.findById(order.userId)).email;
    await sendEmail({
      email: recipientEmail,
      subject: "Order Confirmation - Your Order is Confirmed",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Payment captured and immersive confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Error capturing Razorpay payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment capture failed",
    });
  }
};



const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
