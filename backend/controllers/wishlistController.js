const { sendSuccess, sendError } = require('../utils/helpers');

// NOTA: La wishlist se gestiona en localStorage del frontend
// Estos endpoints NO persisten en SQL, solo devuelven respuestas compatibles

/**
 * GET /api/wishlist
 * Obtiene la lista de favoritos del usuario
 */
const getWishlist = async (req, res, next) => {
  try {
    // El frontend maneja wishlist en localStorage
    sendSuccess(res, [], 'Lista de favoritos obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist
 * Agrega un producto a favoritos
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validar que tenga el productId
    if (!productId) {
      return sendError(res, 'Falta el ID del producto', 400);
    }

    const newItem = {
      id: Date.now(),
      productId,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    sendSuccess(res, newItem, 'Producto agregado a favoritos', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/:productId
 * Elimina un producto de favoritos
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    sendSuccess(res, null, 'Producto eliminado de favoritos');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
