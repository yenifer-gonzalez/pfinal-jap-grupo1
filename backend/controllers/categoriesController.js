const fs = require('fs').promises;
const path = require('path');

// GET /api/categories
// Obtiene todas las categorías desde el archivo JSON
const getCategories = async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../data/cats/cat.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const categories = JSON.parse(fileContent);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error en getCategories:', error);
    next(error);
  }
};

// GET /api/categories/:id
// Obtiene una categoría por ID desde el archivo JSON
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filePath = path.join(__dirname, `../data/cats_products/${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const categoryData = JSON.parse(fileContent);

    res.json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    console.error('Error en getCategoryById:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
};
