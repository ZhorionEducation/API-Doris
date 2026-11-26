const express = require('express');
const router = express.Router();
const controller = require('../controllers/returnsController');

router.get('/devoluciones', controller.getAllDevoluciones);
router.get('/devoluciones/:id', controller.getDevolucionById);
router.post('/devoluciones', controller.registerDevolucion);
router.patch('/devoluciones/:id', controller.updateDevolucion);

module.exports = router;