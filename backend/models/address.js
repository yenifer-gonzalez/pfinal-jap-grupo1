const pool = require('../config/database');

class Address {
  /**
   * Obtiene todas las direcciones de un usuario
   */
  static async getByUserId(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          alias,
          street,
          corner,
          apartment,
          city,
          state,
          zip_code as zipCode,
          country,
          phone,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM addresses
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
   * Crea una nueva dirección
   */
  static async create(userId, addressData) {
    try {
      const {
        alias = 'Mi dirección',
        street,
        corner,
        apartment,
        city,
        state,
        zipCode,
        country = 'Uruguay',
        phone,
        isDefault = false,
      } = addressData;

      // Si esta dirección es por defecto, quitar las demás
      if (isDefault) {
        await pool.query(
          'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      const [result] = await pool.query(
        `INSERT INTO addresses
        (user_id, alias, street, corner, apartment, city, state, zip_code, country, phone, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          alias,
          street,
          corner,
          apartment,
          city,
          state,
          zipCode,
          country,
          phone,
          isDefault ? 1 : 0,
        ]
      );

      // Retornar la dirección creada
      const [rows] = await pool.query(
        `SELECT
          id,
          alias,
          street,
          corner,
          apartment,
          city,
          state,
          zip_code as zipCode,
          country,
          phone,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM addresses
        WHERE id = ?`,
        [result.insertId]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una dirección
   */
  static async update(userId, addressId, updates) {
    try {
      const allowedFields = [
        'alias',
        'street',
        'corner',
        'apartment',
        'city',
        'state',
        'zipCode',
        'country',
        'phone',
        'isDefault',
      ];
      const fields = [];
      const values = [];

      // Si se marca como default, quitar las demás
      if (updates.isDefault) {
        await pool.query(
          'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
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

      values.push(addressId, userId);

      const [result] = await pool.query(
        `UPDATE addresses SET ${fields.join(
          ', '
        )} WHERE id = ? AND user_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Retornar la dirección actualizada
      const [rows] = await pool.query(
        `SELECT
          id,
          alias,
          street,
          corner,
          apartment,
          city,
          state,
          zip_code as zipCode,
          country,
          phone,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM addresses
        WHERE id = ?`,
        [addressId]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una dirección
   */
  static async delete(userId, addressId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una dirección por ID
   */
  static async getById(userId, addressId) {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          alias,
          street,
          corner,
          apartment,
          city,
          state,
          zip_code as zipCode,
          country,
          phone,
          is_default as isDefault,
          created_at as createdAt,
          updated_at as updatedAt
        FROM addresses
        WHERE id = ? AND user_id = ?`,
        [addressId, userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Address;
