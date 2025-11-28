const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

/*
 GET /api/products/:categoryId
 Devuelve productos de una categoría
*/
router.get('/:categoryId', async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const filePath = path.join(__dirname, '../data/cats_products', `${categoryId}.json`);

    const data = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(data);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    next(error);
  }
});

/*
 GET /api/products/detail/:productId
 Devuelve detalles de un producto específico
*/
router.get('/detail/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const filePath = path.join(__dirname, '../data/products', `${productId}.json`);

    const data = await fs.readFile(filePath, 'utf-8');
    const product = JSON.parse(data);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    next(error);
  }
});

/*
 GET /api/products/comments/:productId
 Devuelve comentarios de un producto
*/
router.get('/comments/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const filePath = path.join(__dirname, '../data/products_comments', `${productId}.json`);

    const data = await fs.readFile(filePath, 'utf-8');
    const comments = JSON.parse(data);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron comentarios'
      });
    }
    next(error);
  }
});

module.exports = router;