const pool = require('../config/database');

class PaymentCard {
  /**
   * Obtiene todas las tarjetas de un usuario
   */
  static async getByUserId(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          last_four as lastFour,
          card_name as cardName,
          expiry,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM payment_cards
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea una nueva tarjeta
   */
  static async create(userId, cardData) {
    try {
      const {
        lastFour,
        cardName,
        expiry,
        isDefault = false
      } = cardData;

      // Si esta tarjeta es por defecto, quitar la bandera de las demás
      if (isDefault) {
        await pool.query(
          'UPDATE payment_cards SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      const [result] = await pool.query(
        `INSERT INTO payment_cards
        (user_id, last_four, card_name, expiry, is_default)
        VALUES (?, ?, ?, ?, ?)`,
        [userId, lastFour, cardName, expiry, isDefault ? 1 : 0]
      );

      // Retornar la tarjeta creada
      const [rows] = await pool.query(
        `SELECT
          id,
          last_four as lastFour,
          card_name as cardName,
          expiry,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM payment_cards
        WHERE id = ?`,
        [result.insertId]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una tarjeta
   */
  static async update(userId, cardId, updates) {
    try {
      const allowedFields = ['lastFour', 'cardName', 'expiry', 'isDefault'];
      const fields = [];
      const values = [];

      // Si se marca como default, quitar la bandera de las demás
      if (updates.isDefault) {
        await pool.query(
          'UPDATE payment_cards SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      // Construir la query dinámicamente
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          // Convertir camelCase a snake_case
          const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          fields.push(`${dbField} = ?`);
          values.push(key === 'isDefault' ? (value ? 1 : 0) : value);
        }
      }

      if (fields.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      values.push(cardId, userId);

      const [result] = await pool.query(
        `UPDATE payment_cards SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Retornar la tarjeta actualizada
      const [rows] = await pool.query(
        `SELECT
          id,
          last_four as lastFour,
          card_name as cardName,
          expiry,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM payment_cards
        WHERE id = ?`,
        [cardId]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una tarjeta
   */
  static async delete(userId, cardId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM payment_cards WHERE id = ? AND user_id = ?',
        [cardId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una tarjeta por ID
   */
  static async getById(userId, cardId) {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          last_four as lastFour,
          card_name as cardName,
          expiry,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM payment_cards
        WHERE id = ? AND user_id = ?`,
        [cardId, userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentCard;