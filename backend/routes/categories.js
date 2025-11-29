const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById } = require('../controllers/categoriesController');

/**
 * GET /api/categories
 * Devuelve todas las categorías
 */
router.get('/', getCategories);

/**
 * GET /api/categories/:id
 * Devuelve una categoría por ID
 */
router.get('/:id', getCategoryById);

module.exports = router;
