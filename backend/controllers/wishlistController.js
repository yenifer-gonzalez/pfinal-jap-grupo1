const storage = require('../data/storage');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * GET /api/wishlist
 * Obtiene la lista de favoritos del usuario
 */
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wishlist = storage.getWishlist(userId);
    
    sendSuccess(res, wishlist, 'Lista de favoritos obtenida exitosamente');
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
    const userId = req.user.id;
    const item = req.body;

    // Validar que tenga los datos necesarios
    if (!item.productId || !item.name || !item.cost) {
      return sendError(res, 'Faltan datos del producto', 400);
    }

    // Verificar si ya está en favoritos
    const wishlist = storage.getWishlist(userId);
    const exists = wishlist.find(w => w.productId === item.productId);

    if (exists) {
      return sendError(res, 'El producto ya está en favoritos', 409);
    }

    const newItem = {
      ...item,
      addedAt: new Date().toISOString()
    };

    storage.addToWishlist(userId, newItem);

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
    const userId = req.user.id;
    const { productId } = req.params;

    storage.removeFromWishlist(userId, productId);

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