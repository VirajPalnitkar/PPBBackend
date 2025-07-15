const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const customerInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: addressSchema, required: true },
});

const itemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // Store frontend generated ID
  items: [itemSchema],
  customerInfo: { type: customerInfoSchema, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['qrCode', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
}, { timestamps: true }); // Adds createdAt and updatedAt

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;