const storage = require('../data/storage');
const { sendSuccess, sendError, generateId } = require('../utils/helpers');
const { validateOrder } = require('../utils/validators');

/**
 * GET /api/orders
 * Obtiene todas las órdenes del usuario
 */
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = storage.getOrders(userId);
    
    sendSuccess(res, orders, 'Órdenes obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId
 * Obtiene una orden específica
 */
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    const orders = storage.getOrders(userId);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return sendError(res, 'Orden no encontrada', 404);
    }

    sendSuccess(res, order, 'Orden obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders
 * Crea una nueva orden
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;

    // Validar orden
    const validation = validateOrder(orderData);
    if (!validation.isValid) {
      return sendError(res, 'Datos de la orden inválidos', 400, validation.errors);
    }

    const newOrder = {
      id: generateId('ORD-'),
      ...orderData,
      userId,
      status: orderData.status || 'pending',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    storage.addOrder(userId, newOrder);

    sendSuccess(res, newOrder, 'Orden creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder
};