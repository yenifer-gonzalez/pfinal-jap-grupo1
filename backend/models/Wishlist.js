const pool = require('../config/database');

class Wishlist {
  /**
   * Obtiene todos los productos favoritos de un usuario (con JOIN a products)
   */
  static async getByUserId(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT
          w.id,
          w.product_id as productId,
          w.created_at as addedAt,
          p.name,
          p.cost,
          p.currency,
          pi.image_url as image
        FROM wishlists w
        INNER JOIN products p ON w.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Agrega un producto a favoritos
   */
  static async add(userId, productId) {
    try {
      const [result] = await pool.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );

      // Retornar el item completo con la info del producto
      const [item] = await pool.query(
        `SELECT
          w.id,
          w.product_id as productId,
          w.created_at as addedAt,
          p.name,
          p.cost,
          p.currency,
          pi.image_url as image
        FROM wishlists w
        INNER JOIN products p ON w.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE w.id = ?`,
        [result.insertId]
      );

      return item[0];
    } catch (error) {
      // Si es error de duplicado (código 1062), retornar null
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Elimina un producto de favoritos
   */
  static async remove(userId, productId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica si un producto está en favoritos
   */
  static async exists(userId, productId) {
    try {
      const [rows] = await pool.query(
        'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Wishlist;