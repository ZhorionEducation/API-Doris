const express = require('express');
const router = express.Router();

// importar rutas de cada modulo
const userRoutes = require('./userRoutes');
const shoppingRoutes = require('./shoppingRoutes');
const lotesRoutes = require('./lotesRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const roleRoutes = require('./roleRoutes');
const serviceRoutes = require('./serviceRoutes');
const serviceSupplyRoutes = require('./serviceSupplyRoutes');
const productCategoryRoutes = require('./productCategoryRoutes');

// registrar rutas de cada modulo
router.use('/', userRoutes);
router.use('/', shoppingRoutes);
router.use('/', lotesRoutes);
router.use('/', pedidosRoutes);
router.use('/', roleRoutes);
router.use('/', serviceRoutes);
router.use('/', serviceSupplyRoutes);
router.use('/', productCategoryRoutes);
router.use('/', cancellationsRoutes);
router.use('/', gestionProRoutes);
router.use('/', returnrRoutes);

module.exports = router;