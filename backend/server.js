require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE GLOBAL =====
// CORS: permitir requests desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple 
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ===== RUTAS =====
// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend - Grupo 1',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: 'POST /api/auth/login',
      categories: 'GET /api/categories',
      products: 'GET /api/products/:categoryId',
      productDetail: 'GET /api/products/detail/:productId',
      comments: 'GET /api/products/comments/:productId',
      cart: 'POST /api/cart'
    }
  });
});

// API routes
app.use('/api', routes);

// ===== MANEJO DE ERRORES =====
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`

  Servidor iniciado exitosamente    

  URL: http://localhost:${PORT}      
  Entorno: ${process.env.NODE_ENV || 'development'}           ║
  ${new Date().toLocaleString()}    

  `);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});