const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Importar sub-routers
const authRoutes = require('./auth');
const categoriesRoutes = require('./categories');
const productsRoutes = require('./products');
const cartRoutes = require('./cart');
const profileRoutes = require('./profile');      
const wishlistRoutes = require('./wishlist');    
const ordersRoutes = require('./orders');        

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
router.use('/cart', cartRoutes);
router.use('/profile', profileRoutes);           
router.use('/wishlist', wishlistRoutes);         
router.use('/orders', ordersRoutes);             

module.exports = router;