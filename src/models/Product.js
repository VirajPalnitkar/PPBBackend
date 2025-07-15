const mongoose = require('mongoose');

const nutritionalInfoSchema = new mongoose.Schema({
  calories: { type: Number },
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },
  fiber: { type: Number },
}, { _id: false }); // Don't create an _id for subdocuments

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // Consider auto-generating this or using Mongoose's _id
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number }, // Optional
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, enum: ['spices', 'masalas', 'powders'], required: true },
  weight: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  ingredients: [{ type: String }], // Optional array
  nutritionalInfo: { type: nutritionalInfoSchema }, // Optional object
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;