const storage = require('../data/storage');
const { sendSuccess, sendError, generateId } = require('../utils/helpers');

// ===== PERFIL BÁSICO =====

/**
 * GET /api/profile
 * Obtiene el perfil del usuario
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = storage.getProfile(userId);
    
    sendSuccess(res, profile, 'Perfil obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile
 * Actualiza el perfil del usuario
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updated = storage.updateProfile(userId, updates);

    sendSuccess(res, updated, 'Perfil actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ===== DIRECCIONES =====

/**
 * GET /api/profile/addresses
 * Obtiene todas las direcciones del usuario
 */
const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = storage.getAddresses(userId);
    
    sendSuccess(res, addresses, 'Direcciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/profile/addresses
 * Crea una nueva dirección
 */
const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressData = req.body;

    // Validar campos obligatorios
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
      return sendError(res, 'Faltan campos obligatorios', 400);
    }

    // Crear dirección con ID
    const newAddress = {
      id: generateId('addr_'),
      ...addressData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.addAddress(userId, newAddress);

    sendSuccess(res, newAddress, 'Dirección creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile/addresses/:addressId
 * Actualiza una dirección
 */
const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const updates = req.body;

    const updated = storage.updateAddress(userId, addressId, updates);

    if (!updated) {
      return sendError(res, 'Dirección no encontrada', 404);
    }

    sendSuccess(res, updated, 'Dirección actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/profile/addresses/:addressId
 * Elimina una dirección
 */
const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    storage.deleteAddress(userId, addressId);

    sendSuccess(res, null, 'Dirección eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

// ===== TARJETAS =====

/**
 * GET /api/profile/cards
 * Obtiene todas las tarjetas del usuario
 */
const getCards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cards = storage.getCards(userId);
    
    sendSuccess(res, cards, 'Tarjetas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/profile/cards
 * Crea una nueva tarjeta
 */
const createCard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cardData = req.body;

    // Validar campos obligatorios
    if (!cardData.lastFour || !cardData.cardName || !cardData.expiry) {
      return sendError(res, 'Faltan campos obligatorios', 400);
    }

    const newCard = {
      id: generateId('card_'),
      ...cardData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.addCard(userId, newCard);

    sendSuccess(res, newCard, 'Tarjeta creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile/cards/:cardId
 * Actualiza una tarjeta
 */
const updateCard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    const updates = req.body;

    const updated = storage.updateCard(userId, cardId, updates);

    if (!updated) {
      return sendError(res, 'Tarjeta no encontrada', 404);
    }

    sendSuccess(res, updated, 'Tarjeta actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/profile/cards/:cardId
 * Elimina una tarjeta
 */
const deleteCard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    storage.deleteCard(userId, cardId);

    sendSuccess(res, null, 'Tarjeta eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getCards,
  createCard,
  updateCard,
  deleteCard
};