const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/products/:categoryId
 * Obtiene productos de una categoría desde el archivo JSON
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const filePath = path.join(
      __dirname,
      `../data/cats_products/${categoryId}.json`
    );
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const categoryData = JSON.parse(fileContent);

    res.json({
      success: true,
      data: categoryData.products || [],
    });
  } catch (error) {
    console.error('Error en getProductsByCategory:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }
    next(error);
  }
};

/**
 * GET /api/products/detail/:productId
 * Obtiene el detalle de un producto desde el archivo JSON
 */
const getProductDetail = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const filePath = path.join(__dirname, `../data/products/${productId}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const product = JSON.parse(fileContent);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error en getProductDetail:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    next(error);
  }
};

/**
 * GET /api/products/comments/:productId
 * Obtiene los comentarios de un producto desde el archivo JSON
 */
const getProductComments = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const filePath = path.join(
      __dirname,
      `../data/products_comments/${productId}.json`
    );
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const comments = JSON.parse(fileContent);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error en getProductComments:', error);
    if (error.code === 'ENOENT') {
      return res.json({
        success: true,
        data: [],
      });
    }
    next(error);
  }
};

/**
 * GET /api/products/related/:productId
 * Obtiene productos relacionados (por ahora vacío, se puede implementar después)
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error en getRelatedProducts:', error);
    next(error);
  }
};

/**
 * GET /api/products/search?q=term
 * Busca productos por término (simplificado para JSON)
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda',
      });
    }

    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error en searchProducts:', error);
    next(error);
  }
};

module.exports = {
  getProductsByCategory,
  getProductDetail,
  getProductComments,
  getRelatedProducts,
  searchProducts,
};
