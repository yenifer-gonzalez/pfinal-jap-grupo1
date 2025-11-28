const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/cart
 * Guarda el carrito en la base de datos
 * Requiere autenticación
 * 
 * TODO: Tu compañero implementará esto con la base de datos
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { items, subtotal, discount, shipping, total } = req.body;
    const userId = req.user.id;

    // Validación básica
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito debe contener al menos un producto'
      });
    }

    // TODO: Tu compañero guardará esto en la base de datos
    console.log('📦 Guardando carrito:', {
      userId,
      items,
      subtotal,
      discount,
      shipping,
      total
    });

    // Respuesta placeholder
    res.status(201).json({
      success: true,
      message: 'Carrito guardado exitosamente (placeholder)',
      data: {
        cartId: Date.now(), // ID temporal
        userId,
        itemCount: items.length,
        total
      }
    });

  } catch (error) {
    next(error);
  }
});

/*
 GET /api/cart
 Obtiene el carrito del usuario autenticado
 TODO: ACA VAS VOS YENIFER
*/

router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // TODO: se obtiene esto de la base de datos
    res.json({
      success: true,
      message: 'Carrito obtenido (placeholder)',
      data: {
        items: [],
        total: 0
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;