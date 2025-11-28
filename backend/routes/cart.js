const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { saveCart, getCart, getCartHistory } = require('../controllers/cartController');

/**
 * POST /api/cart
 * Guarda el carrito en la base de datos
 */
router.post('/', authenticate, saveCart);

/**
 * GET /api/cart
 * Obtiene el carrito actual del usuario
 */
router.get('/', authenticate, getCart);

/**
 * GET /api/cart/history
 * Obtiene el historial de compras
 */
router.get('/history', authenticate, getCartHistory);

module.exports = router;