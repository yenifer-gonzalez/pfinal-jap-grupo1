const { sendSuccess, sendError } = require('../utils/helpers');

// NOTA: La wishlist se gestiona en localStorage del frontend
// Estos endpoints NO persisten en MySQL, solo devuelven respuestas compatibles

/**
 * GET /api/wishlist
 * Obtiene la lista de favoritos del usuario (siempre array vacío)
 */
const getWishlist = async (req, res, next) => {
  try {
    // NO leemos de BD, devolvemos array vacío
    // El frontend maneja wishlist en localStorage
    sendSuccess(res, [], 'Lista de favoritos obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist
 * Agrega un producto a favoritos (NO persiste en BD, solo confirma)
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validar que tenga el productId
    if (!productId) {
      return sendError(res, 'Falta el ID del producto', 400);
    }

    // NO guardamos en BD, solo devolvemos confirmación
    // El frontend guarda esto en localStorage
    const newItem = {
      id: Date.now(),
      productId,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    sendSuccess(res, newItem, 'Producto agregado a favoritos', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/:productId
 * Elimina un producto de favoritos (NO persiste en BD, solo confirma)
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    // NO borramos de BD, solo confirmamos
    sendSuccess(res, null, 'Producto eliminado de favoritos');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};