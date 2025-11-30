const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getOrders,
  getOrderById,
  createOrder
} = require('../controllers/ordersController');

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.post('/', createOrder);

module.exports = router;