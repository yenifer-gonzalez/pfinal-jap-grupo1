const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/helpers');
const { validateOrder } = require('../utils/validators');

/**
 * GET /api/orders
 * Obtiene todas las órdenes del usuario
 */
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findByUser(userId);

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

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, 'Orden no encontrada', 404);
    }

    // Verificar que la orden pertenece al usuario
    if (order.user_id !== userId) {
      return sendError(res, 'No tienes permiso para ver esta orden', 403);
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

    // Preparar datos para el modelo
    const orderToCreate = {
      user_id: userId,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      coupon_code: orderData.couponCode || null,
      shipping_cost: orderData.shipping || orderData.shippingCost,
      shipping_type: orderData.shippingType,
      total: orderData.total,
      payment_method: orderData.paymentMethod,
      crypto_currency: orderData.cryptoCurrency || null,
      shipping_address: JSON.stringify(orderData.address),
      items: orderData.items.map(item => ({
        product_id: item.id,
        quantity: item.count || 1,
        unit_price: item.cost,
        currency: item.currency || 'USD'
      }))
    };

    const newOrder = await Order.create(orderToCreate);

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