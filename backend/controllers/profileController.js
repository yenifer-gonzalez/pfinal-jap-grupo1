const { sendSuccess, sendError } = require('../utils/helpers');

// ===== PERFIL BÁSICO =====
// NOTA: Los datos de perfil se gestionan en localStorage del frontend
// Estos endpoints NO persisten en MySQL, solo devuelven respuestas compatibles

/**
 * GET /api/profile
 * Obtiene el perfil del usuario (datos desde JWT, NO desde BD)
 */
const getProfile = async (req, res, next) => {
  try {
    // Los datos vienen del JWT en req.user
    const profile = {
      firstName: req.user.first_name || '',
      lastName: req.user.last_name || '',
      email: req.user.email || '',
      phone: req.user.phone || '',
      profilePhoto: req.user.profile_photo || ''
    };

    sendSuccess(res, profile, 'Perfil obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile
 * Actualiza el perfil del usuario (NO persiste en BD, solo confirma)
 */
const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    // NO guardamos en BD, solo devolvemos los datos recibidos como confirmación
    // El frontend guarda esto en localStorage
    const profile = {
      firstName: updates.firstName || '',
      lastName: updates.lastName || '',
      email: req.user.email, // Email no se puede cambiar
      phone: updates.phone || '',
      profilePhoto: updates.profilePhoto || ''
    };

    sendSuccess(res, profile, 'Perfil actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ===== DIRECCIONES =====
// NOTA: Las direcciones se gestionan en localStorage del frontend
// Estos endpoints NO persisten en MySQL, solo devuelven arrays vacíos o confirmaciones

/**
 * GET /api/profile/addresses
 * Obtiene todas las direcciones del usuario (siempre array vacío)
 */
const getAddresses = async (req, res, next) => {
  try {
    // NO leemos de BD, devolvemos array vacío
    // El frontend maneja direcciones en localStorage
    sendSuccess(res, [], 'Direcciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/profile/addresses
 * Crea una nueva dirección (NO persiste en BD, solo confirma)
 */
const createAddress = async (req, res, next) => {
  try {
    const addressData = req.body;

    // Validar campos obligatorios
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
      return sendError(res, 'Faltan campos obligatorios', 400);
    }

    // NO guardamos en BD, solo devolvemos los datos como confirmación
    // El frontend guarda esto en localStorage
    const newAddress = {
      id: Date.now(), // ID temporal
      ...addressData
    };

    sendSuccess(res, newAddress, 'Dirección creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile/addresses/:addressId
 * Actualiza una dirección (NO persiste en BD, solo confirma)
 */
const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;

    // NO guardamos en BD, solo devolvemos confirmación
    const updated = {
      id: addressId,
      ...updates
    };

    sendSuccess(res, updated, 'Dirección actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/profile/addresses/:addressId
 * Elimina una dirección (NO persiste en BD, solo confirma)
 */
const deleteAddress = async (req, res, next) => {
  try {
    // NO borramos de BD, solo confirmamos
    sendSuccess(res, null, 'Dirección eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

// ===== TARJETAS =====
// NOTA: Las tarjetas se gestionan en localStorage del frontend
// Estos endpoints NO persisten en MySQL, solo devuelven arrays vacíos o confirmaciones

/**
 * GET /api/profile/cards
 * Obtiene todas las tarjetas del usuario (siempre array vacío)
 */
const getCards = async (req, res, next) => {
  try {
    // NO leemos de BD, devolvemos array vacío
    // El frontend maneja tarjetas en localStorage
    sendSuccess(res, [], 'Tarjetas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/profile/cards
 * Crea una nueva tarjeta (NO persiste en BD, solo confirma)
 */
const createCard = async (req, res, next) => {
  try {
    const cardData = req.body;

    // Validar campos obligatorios
    if (!cardData.lastFour || !cardData.cardName || !cardData.expiry) {
      return sendError(res, 'Faltan campos obligatorios', 400);
    }

    // NO guardamos en BD, solo devolvemos los datos como confirmación
    // El frontend guarda esto en localStorage
    const newCard = {
      id: Date.now(), // ID temporal
      ...cardData
    };

    sendSuccess(res, newCard, 'Tarjeta creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profile/cards/:cardId
 * Actualiza una tarjeta (NO persiste en BD, solo confirma)
 */
const updateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const updates = req.body;

    // NO guardamos en BD, solo devolvemos confirmación
    const updated = {
      id: cardId,
      ...updates
    };

    sendSuccess(res, updated, 'Tarjeta actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/profile/cards/:cardId
 * Elimina una tarjeta (NO persiste en BD, solo confirma)
 */
const deleteCard = async (req, res, next) => {
  try {
    // NO borramos de BD, solo confirmamos
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