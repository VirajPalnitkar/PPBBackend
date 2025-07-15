const express = require('express');
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

router.route('/').get(getProducts).post(createProduct); // POST for Admin only
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct); // PUT & DELETE for Admin only
router.get('/category/:category', getProductsByCategory);

module.exports = router;