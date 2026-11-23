const express = require('express');
const router = express.Router();

// importar rutas de cada modulo
const userRoutes = require('./userRoutes');
const shoppingRoutes = require('./shoppingRoutes');
const lotesRoutes = require('./lotesRoutes');
const pedidosRoutes = require('./pedidosRoutes');

// registrar rutas de cada modulo
router.use('/', userRoutes);
router.use('/', shoppingRoutes);
router.use('/', lotesRoutes);
router.use('/', pedidosRoutes);

module.exports = router;