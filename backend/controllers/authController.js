const User = require('../models/User');
const { generateToken } = require('../config/jwt');

// POST /api/auth/login
// Autentica un usuario y devuelve un JWT
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Validar que se envíen username y password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos',
      });
    }

    // 2. Buscar usuario en la base de datos
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // 3. Verificar password
    const isValidPassword = await User.verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // 4. Generar token JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // 5. Responder con éxito (sin enviar la contraseña)
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          profile_photo: user.profile_photo,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    next(error);
  }
};

module.exports = {
  login,
};
