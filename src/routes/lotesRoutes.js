
const express = require('express');
const router = express.Router();

const lotesController = require('../controllers/lotes.controller');

// Consultar detalles de compra disponibles
router.get(
  '/disponibles',
  lotesController.getDetallesDisponibles
);

// Listar todos los lotes
router.get(
  '/',
  lotesController.getAllLotes
);

// Consultar lote por ID
router.get(
  '/:id',
  lotesController.getLoteById
);

// Registrar un nuevo lote
router.post(
  '/',
  lotesController.registerLote
);

// Actualizar un lote
router.put(
  '/:id',
  lotesController.updateLote
);

// Eliminar un lote
router.delete(
  '/:id',
  lotesController.deleteLote
);

module.exports = router;
