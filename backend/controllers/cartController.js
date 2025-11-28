/**
 * Controlador del carrito
 * Tu compañero implementará la lógica real con la base de datos
 */

const { validateCartItems, validateOrder } = require('../utils/validators');
const { sendSuccess, sendError, generateId, calculateCartTotals } = require('../utils/helpers');

/**
 * POST /api/cart
 * Guarda el carrito en la base de datos
 */
const saveCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, subtotal, discount, shipping, total, address, paymentMethod } = req.body;

    // Validar items del carrito
    const validation = validateCartItems(items);
    if (!validation.isValid) {
      return sendError(res, 'Datos del carrito inválidos', 400, validation.errors);
    }

    // Validar orden completa
    const orderValidation = validateOrder(req.body);
    if (!orderValidation.isValid) {
      return sendError(res, 'Datos de la orden inválidos', 400, orderValidation.errors);
    }

    // TODO: YENIFER

    // Simulación por ahora
    const cartId = generateId('CART_');
    
    console.log('📦 Guardando carrito en DB (simulado):', {
      cartId,
      userId,
      itemCount: items.length,
      total
    });

    sendSuccess(res, {
      cartId,
      userId,
      itemCount: items.length,
      total,
      createdAt: new Date().toISOString()
    }, 'Carrito guardado exitosamente', 201);

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart
 * Obtiene el carrito del usuario
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // TODO: YENIFER

    // Simulación por ahora
    const cart = {
      userId,
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0
    };

    sendSuccess(res, cart, 'Carrito obtenido exitosamente');

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart/history
 * Obtiene el historial de compras del usuario
 */
const getCartHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // TODO: YENIFER

    // Simulación por ahora
    const history = [];

    sendSuccess(res, history, 'Historial obtenido exitosamente');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveCart,
  getCart,
  getCartHistory
};