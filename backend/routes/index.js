const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Importar sub-routers
const authRoutes = require('./auth');
const categoriesRoutes = require('./categories');
const productsRoutes = require('./products');
const cartRoutes = require('./cart');

// Ruta de health check (sin autenticación)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas públicas (sin autenticación)
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/categories', authenticate, categoriesRoutes);
router.use('/products', authenticate, productsRoutes);
router.use('/cart', cartRoutes); // Ya tiene authenticate dentro

module.exports = router;