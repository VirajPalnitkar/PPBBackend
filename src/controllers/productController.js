const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid'); // For generating product IDs if needed

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id }); // Find by 'id' field, not _id

    if (!product) {
      const error = new Error(`Product with ID ${req.params.id} not found`);
      error.status = 404;
      return next(error);
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    const validCategories = ['spices', 'masalas', 'powders'];

    if (!validCategories.includes(category.toLowerCase())) {
      const error = new Error(`Invalid category: ${category}. Valid categories are: ${validCategories.join(', ')}.`);
      error.status = 400;
      return next(error);
    }

    const products = await Product.find({ category: { $regex: new RegExp(category, 'i') } }); // Case-insensitive search
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product (Admin Only)
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    // Basic validation
    if (!productData.name || !productData.price || !productData.description || !productData.imageUrl || !productData.category || !productData.weight || productData.stock === undefined) {
      const error = new Error('Missing required product fields');
      error.status = 400;
      return next(error);
    }

    // Generate a new ID for the product
    productData.id = uuidv4();

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const customError = new Error(error.message);
      customError.status = 400;
      return next(customError);
    }
    next(error);
  }
};

// @desc    Update a product (Admin Only)
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      const error = new Error(`Product with ID ${id} not found`);
      error.status = 404;
      return next(error);
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const customError = new Error(error.message);
      customError.status = 400;
      return next(customError);
    }
    next(error);
  }
};

// @desc    Delete a product (Admin Only)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Product.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      const error = new Error(`Product with ID ${id} not found`);
      error.status = 404;
      return next(error);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};