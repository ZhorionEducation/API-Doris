
const pedidosService = require('../services/pedidos.service');

const manejarError = (res, error) => {
  console.error('Error en Gestión de Pedidos:', error);

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'Error interno del servidor'
      : error.message
  });
};

const getAllPedidos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cliente_documento,
      estado,
      fecha_inicio,
      fecha_fin
    } = req.query;

    const resultado = await pedidosService.getAllPedidos(
      page,
      limit,
      {
        cliente_documento,
        estado,
        fecha_inicio,
        fecha_fin
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Pedidos obtenidos correctamente',
      data: resultado
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const getPedidoById = async (req, res) => {
  try {
    const pedido = await pedidosService.getPedidoById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: 'Pedido encontrado',
      data: pedido
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const getDetallePedido = async (req, res) => {
  try {
    const pedido = await pedidosService.getDetallePedido(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: 'Detalle del pedido obtenido correctamente',
      data: pedido
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const getPedidosByCliente = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const resultado = await pedidosService.getPedidosByCliente(
      req.params.documento,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Pedidos del cliente obtenidos correctamente',
      data: resultado
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const getPedidosByEstado = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const resultado = await pedidosService.getPedidosByEstado(
      req.params.estado,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Pedidos filtrados por estado',
      data: resultado
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const getPedidosByFechas = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      page = 1,
      limit = 10
    } = req.query;

    const resultado = await pedidosService.getPedidosByFechas(
      fecha_inicio,
      fecha_fin,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Pedidos filtrados por fechas',
      data: resultado
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  getDetallePedido,
  getPedidosByCliente,
  getPedidosByEstado,
  getPedidosByFechas
};
