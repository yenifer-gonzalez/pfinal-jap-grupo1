const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/*
 Genera un token JWT
 @param {Object} payload - Datos a incluir en el token
 @returns {string} Token generado
*/
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/*
 Verifica un token JWT
 @param {string} token - Token a verificar
 @returns {Object} Payload decodificado o error
*/
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
};