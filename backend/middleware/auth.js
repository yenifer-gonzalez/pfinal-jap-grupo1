const { verifyToken } = require('../config/jwt');

/*
 Middleware de autenticación
 Verifica que el request tenga un token válido
*/
const authenticate = (req, res, next) => {
  try {
    // 1. Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // 2. El token viene como "Bearer TOKEN", extraemos solo el TOKEN
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token mal formado'
      });
    }

    // 3. Verificar el token
    const decoded = verifyToken(token);

    // 4. Agregar información del usuario al request
    req.user = decoded;

    // 5. Continuar con el siguiente middleware o ruta
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

/**
 Middleware opcional: verificar si hay token pero no fallar si no hay
 Útil para rutas que pueden funcionar con o sin autenticación
*/
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;
      
      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};