
const pedidosRepository = require('../repositories/pedidos.repository');

const crearError = (mensaje, statusCode = 400) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const validarEnteroPositivo = (valor, campo) => {
  const numero = Number(valor);

  if (!Number.isSafeInteger(numero) || numero <= 0) {
    throw crearError(`${campo} debe ser un entero positivo`);
  }

  return numero;
};

const validarFecha = (fecha, campo) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw crearError(`${campo} debe tener formato YYYY-MM-DD`);
  }

  const fechaObjeto = new Date(`${fecha}T00:00:00Z`);

  if (
    Number.isNaN(fechaObjeto.getTime()) ||
    fechaObjeto.toISOString().slice(0, 10) !== fecha
  ) {
    throw crearError(`${campo} no es una fecha válida`);
  }

  return fecha;
};

const getAllPedidos = async (page = 1, limit = 10, filtros = {}) => {
  const pagina = validarEnteroPositivo(page, 'page');
  const limite = validarEnteroPositivo(limit, 'limit');

  if (limite > 100) {
    throw crearError('El límite máximo es de 100 registros');
  }

  const filtrosValidados = {};

  if (filtros.cliente_documento) {
    const documento = String(filtros.cliente_documento).trim();

    if (!documento || documento.length > 20) {
      throw crearError('Documento del cliente inválido');
    }

    filtrosValidados.cliente_documento = documento;
  }

  if (filtros.estado) {
    const estados = [
      'Pendiente',
      'Confirmado',
      'Venta',
      'Anulado'
    ];

    if (!estados.includes(filtros.estado)) {
      throw crearError('Estado del pedido inválido');
    }

    filtrosValidados.estado = filtros.estado;
  }

  if (filtros.fecha_inicio) {
    filtrosValidados.fecha_inicio = validarFecha(
      filtros.fecha_inicio,
      'fecha_inicio'
    );
  }

  if (filtros.fecha_fin) {
    filtrosValidados.fecha_fin = validarFecha(
      filtros.fecha_fin,
      'fecha_fin'
    );
  }

  if (
    filtrosValidados.fecha_inicio &&
    filtrosValidados.fecha_fin &&
    filtrosValidados.fecha_inicio > filtrosValidados.fecha_fin
  ) {
    throw crearError(
      'La fecha inicial no puede ser mayor que la fecha final'
    );
  }

  return pedidosRepository.getAllPedidos(
    pagina,
    limite,
    filtrosValidados
  );
};

const getPedidoById = async (id) => {
  const pedidoId = validarEnteroPositivo(id, 'id');

  const pedido = await pedidosRepository.getPedidoById(pedidoId);

  if (!pedido) {
    throw crearError('Pedido no encontrado', 404);
  }

  return pedido;
};

const getDetallePedido = async (id) => {
  const pedidoId = validarEnteroPositivo(id, 'id');

  const pedido = await pedidosRepository.getDetallePedido(pedidoId);

  if (!pedido) {
    throw crearError('Pedido no encontrado', 404);
  }

  return pedido;
};

const getPedidosByCliente = async (
  documento,
  page = 1,
  limit = 10
) => {
  if (typeof documento !== 'string' || !documento.trim()) {
    throw crearError('El documento del cliente es obligatorio');
  }

  return getAllPedidos(page, limit, {
    cliente_documento: documento
  });
};

const getPedidosByEstado = async (
  estado,
  page = 1,
  limit = 10
) => {
  return getAllPedidos(page, limit, { estado });
};

const getPedidosByFechas = async (
  fecha_inicio,
  fecha_fin,
  page = 1,
  limit = 10
) => {
  if (!fecha_inicio || !fecha_fin) {
    throw crearError('Debes proporcionar ambas fechas');
  }

  return getAllPedidos(page, limit, {
    fecha_inicio,
    fecha_fin
  });
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  getDetallePedido,
  getPedidosByCliente,
  getPedidosByEstado,
  getPedidosByFechas
};
