
const express = require('express');
const router = express.Router();

const pedidosController = require('../controllers/pedidos.controller');

// Consultar pedidos por cliente
router.get(
  '/cliente/:documento',
  pedidosController.getPedidosByCliente
);

// Consultar pedidos por estado
router.get(
  '/estado/:estado',
  pedidosController.getPedidosByEstado
);

// Consultar pedidos por rango de fechas
router.get(
  '/fechas',
  pedidosController.getPedidosByFechas
);

// Consultar detalle completo de un pedido
router.get(
  '/:id/detalle',
  pedidosController.getDetallePedido
);

// Consultar un pedido por ID
router.get(
  '/:id',
  pedidosController.getPedidoById
);

// Listar todos los pedidos
router.get(
  '/',
  pedidosController.getAllPedidos
);

module.exports = router;
