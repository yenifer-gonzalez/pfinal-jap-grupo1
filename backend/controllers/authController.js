const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

/*
  Usuarios hardcodeados para pruebas
  En producción, estos vendrían de la base de datos
  
  Password: todas son "password123" hasheadas con bcrypt
*/
const USERS = [
  {
    id: 1,
    username: 'admin@ecommerce.com',
    // password123 hasheado
    password: '$2a$10$ZGK5QiGFQzh5.VzAYnQW9.rQjmFVJN6VQJZ/qjdO5dHLJV8vqsQYy',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user@example.com',
    password: '$2a$10$ZGK5QiGFQzh5.VzAYnQW9.rQjmFVJN6VQJZ/qjdO5dHLJV8vqsQYy',
    role: 'user'
  }
];

/*
  POST /login
  Autentica un usuario y devuelve un JWT
*/
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Validar que se envíen username y password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos'
      });
    }

    // 2. Buscar usuario (en producción sería en la DB)
    const user = USERS.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 3. Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 4. Generar token JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    // 5. Responder con éxito
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/*
generar hash de password (para crear nuevos usuarios)
*/
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = {
  login,
  hashPassword
};