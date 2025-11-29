const { query } = require('../config/database');

class Category {
  /**
   * Obtiene todas las categorías
   * @returns {Promise<Array>} - Lista de categorías
   */
  static async findAll() {
    try {
      const sql = `
        SELECT id, name, description, img_src, created_at, updated_at
        FROM categories
        ORDER BY name ASC
      `;
      return await query(sql);
    } catch (error) {
      console.error('Error en Category.findAll:', error.message);
      throw error;
    }
  }

  /**
   * Busca una categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object|null>} - Categoría encontrada o null
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT id, name, description, img_src, created_at, updated_at
        FROM categories
        WHERE id = ?
      `;
      const categories = await query(sql, [id]);
      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      console.error('Error en Category.findById:', error.message);
      throw error;
    }
  }

  /**
   * Cuenta la cantidad de productos en una categoría
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<number>} - Cantidad de productos
   */
  static async countProducts(categoryId) {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM products
        WHERE category_id = ?
      `;
      const result = await query(sql, [categoryId]);
      return result[0].count;
    } catch (error) {
      console.error('Error en Category.countProducts:', error.message);
      throw error;
    }
  }
}

module.exports = Category;
