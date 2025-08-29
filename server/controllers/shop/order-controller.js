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

    // Reduce the total stock and color inventory for each product in the order
    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);

      // Reduce total stock
      product.totalStock -= item.quantity;

      // Reduce color inventory if the item has a color
      if (item.colors && item.colors._id) {
        const colorIndex = product.colors.findIndex(color =>
          color._id.toString() === item.colors._id.toString()
        );

        if (colorIndex !== -1) {
          product.colors[colorIndex].inventory -= item.quantity;
          // Ensure inventory doesn't go below 0
          if (product.colors[colorIndex].inventory < 0) {
            product.colors[colorIndex].inventory = 0;
          }
        }
      }

      await product.save();
    }

    await order.save();


    // Prepare immersive email message with detailed order information and an appealing UI.
    const message = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #fed1d6; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dhkdsvdvr/image/upload/v1740216811/logo3_moey1d.png" alt="Logo" style="max-width: 150px;">
      <h2 style="margin-bottom: 5px;">Order Confirmed!</h2>
        <p style="font-size: 16px; margin-top: 0;">Thank you for your purchase.</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="border-bottom: 2px solid #fed1d6; padding-bottom: 10px;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment ID:</strong> ${order.paymentId}</p>

        ${order.cartItems && order.cartItems.length ? `
          <h4 style="margin-top: 20px;">Items Ordered</h4>
          <div style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table style="width: 100%; min-width: 500px; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: left;">Product</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Code</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Quantity</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Price</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Color</th>
                </tr>
              </thead>
              <tbody>
                ${order.cartItems.map(item => `
                  <tr>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${item?.image || ''}" alt="${item?.title || ''}"
                          style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; flex-shrink: 0;">
                        <span style="font-weight: 600;">${item?.title || ''}</span>
                      </div>
                    </td>

                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600; font-family: monospace; font-size: 12px; color: #666;">${item?.productCode || "-"}</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600;">${item?.quantity}</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600;">₹${item?.price}</td>



                     <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center;">
                      ${item?.colors && item.colors.title ? `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                          ${item.colors.image ? `<img src="${item.colors.image}" alt="${item.colors.title}" style="width: 25px; height: 25px; object-fit: cover; border-radius: 3px;">` : ''}
                          <span style="font-weight: 600;">${item.colors.title}</span>
                        </div>
                      ` : ''}
                    </td>

                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2c3315;">
          <h4 style="margin: 0 0 15px 0; color: #2c3315; font-size: 16px;">📍 Shipping Address</h4>
          <div style="background-color: white; padding: 12px; border-radius: 4px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3315;">${order.user?.userName || 'Customer'}</p>
            <p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo?.address || 'N/A'}</p>
            ${order.addressInfo?.state ? `<p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo.state}</p>` : ''}
            <p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo?.city || 'N/A'} - ${order.addressInfo?.pincode || 'N/A'}</p>
            <p style="margin: 0 0 8px 0; color: #333;"><strong>Phone:</strong> ${order.addressInfo?.phone || 'N/A'}</p>
            ${order.addressInfo?.notes ? `<p style="margin: 8px 0 0 0; padding: 8px; background-color: #f8f9fa; border-radius: 3px; font-style: italic; color: #666; font-size: 14px;"><strong>Delivery Notes:</strong> ${order.addressInfo.notes}</p>` : ''}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/shop/account" style="display: inline-block; background-color: #fed1d6; color: #2c3315; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 4px; font-weight: bold;"> View Your Order</a>
        </div>
      </div>
      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>
  `;





    // Determine the recipient email using order.email or fallback to the user's profile.
    const recipientEmail = order.email || (await User.findById(order.userId)).email;

    // Send confirmation email to customer
    await sendEmail({
      email: recipientEmail,
      subject: "Order Confirmation - Your Order is Confirmed",
      message,
    });

    // Send notification email to admin
    const adminEmail = "rachanaboutiquechennai@gmail.com";
    const adminMessage = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #fed1d6; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dhkdsvdvr/image/upload/v1740216811/logo3_moey1d.png" alt="Logo" style="max-width: 150px;">
        <h2 style="margin-bottom: 5px;">New Order Received!</h2>
        <p style="font-size: 16px; margin-top: 0;">A new order has been placed and payment confirmed.</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="border-bottom: 2px solid #fed1d6; padding-bottom: 10px;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer Email:</strong> ${recipientEmail}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment Status:</strong> Paid</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString("en-GB")}</p>

        ${order.cartItems && order.cartItems.length > 0 ? `
          <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 10px;">Items Ordered:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: left;">Product</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Code</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Quantity</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Price</th>
                  <th style="border-bottom: 2px solid #fed1d6; padding: 12px; background-color: #f0f0f0; text-align: center;">Color</th>
                </tr>
              </thead>
              <tbody>
                ${order.cartItems.map(item => `
                  <tr>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${item?.image || ''}" alt="${item?.title || ''}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; flex-shrink: 0;">
                        <span style="font-weight: 600;">${item?.title || ''}</span>
                      </div>
                    </td>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600; font-family: monospace; font-size: 12px; color: #666;">${item?.productCode || "-"}</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600;">${item?.quantity}</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600;">₹${item?.price}</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 12px; text-align: center;">
                      ${item?.colors && item.colors.title ? `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                          ${item.colors.image ? `<img src="${item.colors.image}" alt="${item.colors.title}" style="width: 25px; height: 25px; object-fit: cover; border-radius: 3px;">` : ''}
                          <span style="font-weight: 600;">${item.colors.title}</span>
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <h4 style="margin: 0 0 15px 0; color: #856404; font-size: 16px;">👤 Customer & Shipping Information</h4>
          <div style="background-color: white; padding: 12px; border-radius: 4px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #2c3315; font-size: 15px;">${order.user?.userName || 'Customer'}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${order.user?.email || 'N/A'}</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3315;">📍 Delivery Address:</p>
              <div style="margin-left: 15px; line-height: 1.5;">
                <p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo?.address || 'N/A'}</p>
                ${order.addressInfo?.state ? `<p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo.state}</p>` : ''}
                <p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo?.city || 'N/A'} - ${order.addressInfo?.pincode || 'N/A'}</p>
                <p style="margin: 0 0 8px 0; color: #333;"><strong>📞 Phone:</strong> ${order.addressInfo?.phone || 'N/A'}</p>
                ${order.addressInfo?.notes ? `<p style="margin: 8px 0 0 0; padding: 8px; background-color: #f8f9fa; border-radius: 3px; font-style: italic; color: #666; font-size: 13px;"><strong>📝 Delivery Notes:</strong> ${order.addressInfo.notes}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p>Please process this order for fulfillment.</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: adminEmail,
      subject: `New Order #${order._id.toString().slice(-8)} - ₹${order.totalAmount}`,
      message: adminMessage,
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
