/**
 * Validadores para requests
 */

/**
 * Valida datos de login
 * @param {Object} data - Datos a validar
 * @returns {Object} { isValid, errors }
 */
const validateLogin = (data) => {
  const errors = [];

  if (!data.username || data.username.trim() === '') {
    errors.push('El username es requerido');
  }

  if (!data.password || data.password.trim() === '') {
    errors.push('El password es requerido');
  }

  if (data.password && data.password.length < 6) {
    errors.push('El password debe tener al menos 6 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida items del carrito
 * @param {Array} items - Items a validar
 * @returns {Object} { isValid, errors }
 */
const validateCartItems = (items) => {
  const errors = [];

  if (!Array.isArray(items)) {
    return {
      isValid: false,
      errors: ['Los items deben ser un array']
    };
  }

  if (items.length === 0) {
    return {
      isValid: false,
      errors: ['El carrito debe contener al menos un producto']
    };
  }

  items.forEach((item, index) => {
    if (!item.id) {
      errors.push(`Item ${index + 1}: falta el ID del producto`);
    }

    if (!item.name) {
      errors.push(`Item ${index + 1}: falta el nombre del producto`);
    }

    if (typeof item.cost !== 'number' || item.cost <= 0) {
      errors.push(`Item ${index + 1}: el costo debe ser un número positivo`);
    }

    if (typeof item.count !== 'number' || item.count <= 0) {
      errors.push(`Item ${index + 1}: la cantidad debe ser un número positivo`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida datos de un pedido completo
 * @param {Object} orderData - Datos del pedido
 * @returns {Object} { isValid, errors }
 */
const validateOrder = (orderData) => {
  const errors = [];

  // Validar items
  const itemsValidation = validateCartItems(orderData.items || []);
  if (!itemsValidation.isValid) {
    errors.push(...itemsValidation.errors);
  }

  // Validar totales
  if (typeof orderData.subtotal !== 'number' || orderData.subtotal < 0) {
    errors.push('El subtotal debe ser un número válido');
  }

  if (typeof orderData.total !== 'number' || orderData.total < 0) {
    errors.push('El total debe ser un número válido');
  }

  // Validar dirección (si existe)
  if (orderData.address) {
    if (!orderData.address.street || orderData.address.street.trim() === '') {
      errors.push('La dirección debe incluir una calle');
    }

    if (!orderData.address.city || orderData.address.city.trim() === '') {
      errors.push('La dirección debe incluir una ciudad');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un ID numérico
 * @param {*} id - ID a validar
 * @param {string} fieldName - Nombre del campo (para errores)
 * @returns {Object} { isValid, errors }
 */
const validateNumericId = (id, fieldName = 'ID') => {
  const errors = [];
  const numId = Number(id);

  if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
    errors.push(`${fieldName} debe ser un número entero positivo`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateLogin,
  validateCartItems,
  validateOrder,
  validateNumericId
};