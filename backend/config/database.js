const mysql = require('mysql2/promise');

let pool;

// Crea el pool de conexiones a la base de datos
const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

// Obtiene el pool de conexiones
const getPool = () => {
  if (!pool) {
    return createPool();
  }
  return pool;
};

// Ejecuta una query en la base de datos
// @param {string} sql - Query SQL a ejecutar
// @param {Array} params - Parámetros para la query (opcional)
// @returns {Promise} - Resultado de la query
const query = async (sql, params = []) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Prueba la conexión a la base de datos
const testConnection = async () => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    throw error;
  }
};

// Cierra el pool de conexiones
const closePool = async () => {
  try {
    if (pool) {
      await pool.end();
    }
  } catch (error) {
    console.error('Error al cerrar el pool:', error.message);
    throw error;
  }
};

module.exports = {
  query,
  testConnection,
  closePool,
  getPool,
};
