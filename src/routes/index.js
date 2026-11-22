const express = require('express');
const router = express.Router();

// importar rutas de cada modulo
const userRoutes = require('./userRoutes');
const shoppingRoutes = require('./shoppingRoutes');
const gestionProRoutes = require('./gestionProRoutes');

// registrar rutas de cada modulo
router.use('/', userRoutes);
router.use('/', shoppingRoutes);
router.use('/', gestionProRoutes);

module.exports = router;``