const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

/*
 GET /api/categories
 Devuelve todas las categorías
*/
router.get('/', async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../data/cats/cat.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const categories = JSON.parse(data);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;