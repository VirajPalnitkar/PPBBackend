const express = require('express');
const {
  getOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  sendOrderConfirmation,
} = require('../controllers/orderController');

const router = express.Router();

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder);
router.post('/send-confirmation', sendOrderConfirmation);

module.exports = router;