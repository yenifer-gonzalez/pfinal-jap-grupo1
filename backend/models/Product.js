const { query } = require('../config/database');

class Product {
  /**
   * Obtiene todos los productos de una categoría
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<Array>} - Lista de productos
   */
  static async findByCategory(categoryId) {
    try {
      const sql = `
        SELECT p.id, p.category_id, p.name, p.description, p.cost,
               p.currency, p.sold_count, p.created_at,
               pi.image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE p.category_id = ?
        ORDER BY p.sold_count DESC
      `;
      return await query(sql, [categoryId]);
    } catch (error) {
      console.error('Error en Product.findByCategory:', error.message);
      throw error;
    }
  }

  /**
   * Busca un producto por ID con todas sus imágenes
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} - Producto encontrado con imágenes o null
   */
  static async findById(id) {
    try {
      // Obtener datos del producto
      const productSql = `
        SELECT id, category_id, name, description, cost, currency, sold_count, created_at
        FROM products
        WHERE id = ?
      `;
      const products = await query(productSql, [id]);

      if (products.length === 0) {
        return null;
      }

      const product = products[0];

      // Obtener imágenes del producto
      const imagesSql = `
        SELECT id, image_url, is_primary, display_order
        FROM product_images
        WHERE product_id = ?
        ORDER BY display_order ASC
      `;
      product.images = await query(imagesSql, [id]);

      return product;
    } catch (error) {
      console.error('Error en Product.findById:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene los comentarios de un producto
   * @param {number} productId - ID del producto
   * @returns {Promise<Array>} - Lista de comentarios
   */
  static async getComments(productId) {
    try {
      const sql = `
        SELECT pc.id, pc.product_id, pc.user_id, pc.score, pc.description,
               pc.created_at, u.username, u.email
        FROM product_comments pc
        JOIN users u ON pc.user_id = u.id
        WHERE pc.product_id = ?
        ORDER BY pc.created_at DESC
      `;
      return await query(sql, [productId]);
    } catch (error) {
      console.error('Error en Product.getComments:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene productos relacionados
   * @param {number} productId - ID del producto
   * @returns {Promise<Array>} - Lista de productos relacionados
   */
  static async getRelated(productId) {
    try {
      const sql = `
        SELECT p.id, p.name, p.description, p.cost, p.currency,
               p.sold_count, pi.image_url
        FROM related_products rp
        JOIN products p ON rp.related_product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE rp.product_id = ?
      `;
      return await query(sql, [productId]);
    } catch (error) {
      console.error('Error en Product.getRelated:', error.message);
      throw error;
    }
  }

  /**
   * Busca productos por nombre o descripción
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} - Lista de productos
   */
  static async search(searchTerm) {
    try {
      const sql = `
        SELECT p.id, p.category_id, p.name, p.description, p.cost,
               p.currency, p.sold_count, pi.image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE p.name LIKE ? OR p.description LIKE ?
        ORDER BY p.sold_count DESC
        LIMIT 50
      `;
      const searchPattern = `%${searchTerm}%`;
      return await query(sql, [searchPattern, searchPattern]);
    } catch (error) {
      console.error('Error en Product.search:', error.message);
      throw error;
    }
  }
}

module.exports = Product;
