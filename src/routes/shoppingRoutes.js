const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shoppingController');

// ruta compras
router.get('/shopping', shoppingController.getAllShoppiing);

module.exports = router;