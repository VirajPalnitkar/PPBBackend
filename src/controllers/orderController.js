const Order = require('../models/Order');
const transporter = require('../config/mailer');
const generateOrderId = require('../utils/orderIdGenerator'); // If you decide to generate IDs in backend

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (or Private for Admin)
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({});
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;

    // Validate incoming data (basic example)
    if (!orderData.items || orderData.items.length === 0 || !orderData.customerInfo || !orderData.total) {
      const error = new Error('Missing required order fields');
      error.status = 400;
      return next(error);
    }

    // Use frontend ID or generate if frontend doesn't provide
    orderData.id = orderData.id || generateOrderId(); // Uncomment if you want to generate in backend

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const customError = new Error(error.message);
      customError.status = 400;
      return next(customError);
    }
    next(error);
  }
};

// @desc    Get a specific order by ID
// @route   GET /api/orders/:id
// @access  Public (or Private for Admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ id: req.params.id }); // Find by 'id' field, not _id

    if (!order) {
      const error = new Error(`Order with ID ${req.params.id} not found`);
      error.status = 404;
      return next(error);
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing order
// @route   PUT /api/orders/:id
// @access  Public (or Private for Admin)
exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { id: id },
      { $set: updateFields },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedOrder) {
      const error = new Error(`Order with ID ${id} not found`);
      error.status = 404;
      return next(error);
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const customError = new Error(error.message);
      customError.status = 400;
      return next(customError);
    }
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Public (or Private for Admin)
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Order.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      const error = new Error(`Order with ID ${id} not found`);
      error.status = 404;
      return next(error);
    }
    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
};

// @desc    Send order confirmation email
// @route   POST /api/orders/send-confirmation
// @access  Public
exports.sendOrderConfirmation = async (req, res, next) => {
  const { customerName, customerEmail, orderId, items, total, shippingAddress } = req.body;

  // Basic validation
  if (!customerName || !customerEmail || !orderId || !items || !total || !shippingAddress) {
    const error = new Error('Missing required fields for email confirmation');
    error.status = 400;
    return next(error);
  }

  const businessEmails = [
    process.env.BUSINESS_EMAIL_1,
    process.env.BUSINESS_EMAIL_2,
  ].filter(Boolean); // Filter out any undefined/null values

  if (businessEmails.length === 0) {
    const error = new Error('Business email addresses not configured in environment variables.');
    error.status = 500;
    return next(error);
  }

  const itemsHtml = items.map(item => `
    <li>${item.productName} (x${item.quantity}) - $${item.price.toFixed(2)} each</li>
  `).join('');

  const mailOptions = {
    from: `"Pranav Foods" <${process.env.EMAIL_USER}>`,
    to: `${customerEmail}, ${businessEmails.join(', ')}`, // Send to customer and business emails
    subject: `Order Confirmation - Pranav Foods - Order #${orderId}`,
    html: `
      <h2>Order Confirmation for ${customerName}</h2>
      <p>Thank you for your order from Pranav Foods!</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <h3>Order Details:</h3>
      <ul>
        ${itemsHtml}
      </ul>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <h3>Shipping Address:</h3>
      <p>
        ${shippingAddress.street}<br>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>
      <p>Your order status is currently <strong>pending</strong>. We will notify you once it's processed.</p>
      <p>For any inquiries, please contact us.</p>
      <p>Best regards,<br>Pranav Foods Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Order confirmation email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    const customError = new Error('Failed to send order confirmation email.');
    customError.status = 500;
    next(customError);
  }
};