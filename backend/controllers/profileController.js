const { sendSuccess, sendError } = require('../utils/helpers');

// ===== PERFIL BÁSICO =====
// NOTA: Los datos de perfil se gestionan en localStorage del frontend
// Estos endpoints NO persisten en SQL, solo devuelven respuestas compatibles

/**
 * GET /api/profile
 * Obtiene el perfil del usuario
 */
const getProfile = async (req, res, next) => {
  try {
    // Los datos vienen del JWT en req.user
    const profile = {
      firstName: req.user.first_name || '',
      lastName: req.user.last_name || '',
      email: req.user.email || '',
      phone: req.user.phone || '',
      profilePhoto: req.user.profile_photo || '',
    };

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
    const updates = req.body;

    // El frontend guarda esto en localStorage
    const profile = {
      firstName: updates.firstName || '',
      lastName: updates.lastName || '',
      email: req.user.email, // Email no se puede cambiar
      phone: updates.phone || '',
      profilePhoto: updates.profilePhoto || '',
    };

    sendSuccess(res, profile, 'Perfil actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ===== DIRECCIONES =====
/**
 * GET /api/profile/addresses
 * Obtiene todas las direcciones del usuario (siempre array vacío)
 */
const getAddresses = async (req, res, next) => {
  try {
    // El frontend maneja direcciones en localStorage
    sendSuccess(res, [], 'Direcciones obtenidas exitosamente');
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
    const addressData = req.body;

    // Validar campos obligatorios
    if (
      !addressData.street ||
      !addressData.city ||
      !addressData.state ||
      !addressData.zipCode
    ) {
      return sendError(res, 'Faltan campos obligatorios', 400);
    }

    // El frontend guarda esto en localStorage
    const newAddress = {
      id: Date.now(), // ID temporal
      ...addressData,
    };

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
    const { addressId } = req.params;
    const updates = req.body;

    const updated = {
      id: addressId,
      ...updates,
    };

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
    sendSuccess(res, null, 'Dirección eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

// ===== TARJETAS =====
// NOTA: Las tarjetas se gestionan en localStorage del frontend
// Estos endpoints NO persisten enSQL, solo devuelven arrays vacíos o confirmaciones

/**
 * GET /api/profile/cards
 * Obtiene todas las tarjetas del usuario (siempre array vacío)
 */
const getCards = async (req, res, next) => {
  try {
    // El frontend maneja tarjetas en localStorage
    sendSuccess(res, [], 'Tarjetas obtenidas exitosamente');
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
    const cardData = req.body;

    // Validar campos obligatorios
    if (!cardData.lastFour || !cardData.cardName || !cardData.expiry) {
      return sendError(res, 'Faltan campos obligatorios', 400);
    }

    // El frontend guarda esto en localStorage
    const newCard = {
      id: Date.now(), // ID temporal
      ...cardData,
    };

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
    const { cardId } = req.params;
    const updates = req.body;

    const updated = {
      id: cardId,
      ...updates,
    };

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
  deleteCard,
};
