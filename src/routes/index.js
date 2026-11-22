const express = require('express');
const router = express.Router();

// importar rutas de cada modulo
const userRoutes = require('./userRoutes');

// registrar rutas de cada modulo
router.use('/', userRoutes);

module.exports = router;