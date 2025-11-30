const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/profileController');

// Nota: autenticación ya se aplica en routes/index.js

// Perfil básico
router.get('/', getProfile);
router.put('/', updateProfile);

// Direcciones
router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Tarjetas
router.get('/cards', getCards);
router.post('/cards', createCard);
router.put('/cards/:cardId', updateCard);
router.delete('/cards/:cardId', deleteCard);

module.exports = router;