const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/ordersController');

/**
 * POST /api/cart
 * Guarda el carrito como una orden en la base de datos
 * Nota: autenticación ya se aplica en routes/index.js
 */
router.post('/', createOrder);

module.exports = router;