const express = require('express');
const router = express.Router();
const {
  getProductsByCategory,
  getProductDetail,
  getProductComments,
  getRelatedProducts,
  searchProducts
} = require('../controllers/productsController');

/**
 * GET /api/products/search?q=term
 * Busca productos por término
 * IMPORTANTE: Esta ruta debe ir ANTES de /:categoryId
 */
router.get('/search', searchProducts);

/**
 * GET /api/products/detail/:productId
 * Devuelve detalles de un producto específico
 * IMPORTANTE: Esta ruta debe ir ANTES de /:categoryId
 */
router.get('/detail/:productId', getProductDetail);

/**
 * GET /api/products/comments/:productId
 * Devuelve comentarios de un producto
 * IMPORTANTE: Esta ruta debe ir ANTES de /:categoryId
 */
router.get('/comments/:productId', getProductComments);

/**
 * GET /api/products/related/:productId
 * Devuelve productos relacionados
 * IMPORTANTE: Esta ruta debe ir ANTES de /:categoryId
 */
router.get('/related/:productId', getRelatedProducts);

/**
 * GET /api/products/:categoryId
 * Devuelve productos de una categoría
 * IMPORTANTE: Esta ruta debe ir AL FINAL
 */
router.get('/:categoryId', getProductsByCategory);

module.exports = router;
