const { query } = require('../config/database');

class Order {
  /**
   * Crea una nueva orden con sus items
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise<Object>} - Orden creada
   */
  static async create(orderData) {
    try {
      const {
        user_id,
        subtotal,
        discount = 0,
        coupon_code = null,
        shipping_cost,
        shipping_type,
        total,
        payment_method,
        crypto_currency = null,
        shipping_address,
        items = [],
      } = orderData;

      // 1. Crear la orden
      const orderSql = `
        INSERT INTO orders (
          user_id, subtotal, discount, coupon_code, shipping_cost,
          shipping_type, total, payment_method, crypto_currency, shipping_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const orderResult = await query(orderSql, [
        user_id,
        subtotal,
        discount,
        coupon_code,
        shipping_cost,
        shipping_type,
        total,
        payment_method,
        crypto_currency,
        shipping_address,
      ]);

      const orderId = orderResult.insertId;

      // 2. Insertar los items de la orden
      if (items.length > 0) {
        const itemSql = `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, currency)
          VALUES (?, ?, ?, ?, ?)
        `;

        for (const item of items) {
          await query(itemSql, [
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.currency || 'USD',
          ]);
        }
      }

      // 3. Retornar la orden completa
      return await Order.findById(orderId);
    } catch (error) {
      console.error('Error en Order.create:', error.message);
      throw error;
    }
  }

  /**
   * Busca una orden por ID con sus items
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object|null>} - Orden con items o null
   */
  static async findById(orderId) {
    try {
      // Obtener la orden
      const orderSql = `
        SELECT id, user_id, subtotal, discount, coupon_code, shipping_cost,
               shipping_type, total, payment_method, crypto_currency,
               shipping_address, status, created_at
        FROM orders
        WHERE id = ?
      `;
      const orders = await query(orderSql, [orderId]);

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];

      // Obtener los items de la orden
      const itemsSql = `
        SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, oi.currency,
               p.name as product_name, p.description as product_description
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      order.items = await query(itemsSql, [orderId]);

      return order;
    } catch (error) {
      console.error('Error en Order.findById:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene todas las órdenes de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de órdenes
   */
  static async findByUser(userId) {
    try {
      const sql = `
        SELECT id, user_id, subtotal, discount, shipping_cost, shipping_type,
               total, payment_method, status, created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      return await query(sql, [userId]);
    } catch (error) {
      console.error('Error en Order.findByUser:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} status - Nuevo estado (pending, processing, shipped, delivered, cancelled)
   * @returns {Promise<Object>} - Orden actualizada
   */
  static async updateStatus(orderId, status) {
    try {
      const sql = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
      `;
      await query(sql, [status, orderId]);
      return await Order.findById(orderId);
    } catch (error) {
      console.error('Error en Order.updateStatus:', error.message);
      throw error;
    }
  }
}

module.exports = Order;
