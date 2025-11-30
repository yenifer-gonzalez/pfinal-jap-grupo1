const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Busca un usuario por username o email
   * @param {string} username - Username o email del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  static async findByUsername(username) {
    try {
      const sql = `
        SELECT id, username, email, password, role, first_name, last_name,
               phone, profile_photo, created_at, updated_at
        FROM users
        WHERE username = ? OR email = ?
      `;
      const users = await query(sql, [username, username]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error en User.findByUsername:', error.message);
      throw error;
    }
  }

  /**
   * Busca un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT id, username, email, role, first_name, last_name,
               phone, profile_photo, created_at, updated_at
        FROM users
        WHERE id = ?
      `;
      const users = await query(sql, [id]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error en User.findById:', error.message);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado
   */
  static async create(userData) {
    try {
      const {
        username,
        email,
        password,
        role = 'user',
        first_name,
        last_name,
        phone,
      } = userData;

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users (username, email, password, role, first_name, last_name, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        username,
        email,
        hashedPassword,
        role,
        first_name || null,
        last_name || null,
        phone || null,
      ]);

      // Retornar el usuario creado
      return await User.findById(result.insertId);
    } catch (error) {
      console.error('Error en User.create:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza un usuario
   * @param {number} id - ID del usuario
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  static async update(id, updates) {
    try {
      // Soportar tanto camelCase (del frontend) como snake_case (de la BD)
      const first_name = updates.firstName || updates.first_name;
      const last_name = updates.lastName || updates.last_name;
      const phone = updates.phone;
      const profile_photo = updates.profilePhoto || updates.profile_photo;

      const sql = `
        UPDATE users
        SET first_name = ?, last_name = ?, phone = ?, profile_photo = ?
        WHERE id = ?
      `;

      await query(sql, [
        first_name || null,
        last_name || null,
        phone || null,
        profile_photo || null,
        id,
      ]);

      return await User.findById(id);
    } catch (error) {
      console.error('Error en User.update:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si una contraseña es válida
   * @param {string} plainPassword - Contraseña sin encriptar
   * @param {string} hashedPassword - Contraseña encriptada
   * @returns {Promise<boolean>} - True si la contraseña es válida
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error en User.verifyPassword:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios (solo para admin)
   * @returns {Promise<Array>} - Lista de usuarios
   */
  static async findAll() {
    try {
      const sql = `
        SELECT id, username, email, role, first_name, last_name,
               phone, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
      return await query(sql);
    } catch (error) {
      console.error('Error en User.findAll:', error.message);
      throw error;
    }
  }
}

module.exports = User;
