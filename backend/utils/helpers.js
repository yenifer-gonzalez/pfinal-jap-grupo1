/**
 * Funciones auxiliares reutilizables
 */

/**
 * Formatea una fecha a string legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Genera un ID único
 * @param {string} prefix - Prefijo opcional
 * @returns {string} ID único
 */
const generateId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}${random}`;
};

/**
 * Calcula el total de un carrito
 * @param {Array} items - Items del carrito
 * @param {number} discount - Descuento a aplicar
 * @param {number} shipping - Costo de envío
 * @returns {Object} Totales calculados
 */
const calculateCartTotals = (items, discount = 0, shipping = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.cost * item.count);
  }, 0);

  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount + shipping;

  return {
    subtotal,
    discountAmount,
    shipping,
    total
  };
};

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Respuesta de éxito estandarizada
 * @param {Object} res - Response object de Express
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código de estado HTTP
 */
const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Respuesta de error estandarizada
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {*} errors - Errores adicionales
 */
const sendError = (res, message = 'Error en la operación', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Wrapper para async functions que maneja errores automáticamente
 * @param {Function} fn - Función async a envolver
 * @returns {Function} Función envuelta con manejo de errores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Delay para testing/simulaciones
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  formatDate,
  generateId,
  calculateCartTotals,
  isValidEmail,
  sanitizeString,
  sendSuccess,
  sendError,
  asyncHandler,
  delay
};