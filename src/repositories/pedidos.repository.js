
const db = require('../config/db');

const getAllPedidos = async (page = 1, limit = 10, filtros = {}) => {
  const condiciones = [];
  const parametros = [];

  if (filtros.cliente_documento) {
    condiciones.push('p.cliente_documento = ?');
    parametros.push(filtros.cliente_documento);
  }

  if (filtros.estado) {
    condiciones.push('p.estado = ?');
    parametros.push(filtros.estado);
  }

  if (filtros.fecha_inicio) {
    condiciones.push('p.fecha_pedido >= ?');
    parametros.push(filtros.fecha_inicio);
  }

  if (filtros.fecha_fin) {
    condiciones.push('p.fecha_pedido <= ?');
    parametros.push(filtros.fecha_fin);
  }

  const where = condiciones.length
    ? `WHERE ${condiciones.join(' AND ')}`
    : '';

  const [conteo] = await db.query(
    `SELECT COUNT(*) AS total
     FROM tb_pedidos p
     ${where}`,
    parametros
  );

  const total = conteo[0].total;
  const offset = (page - 1) * limit;

  const [pedidos] = await db.query(
    `SELECT
       p.*,
       CONCAT(c.nombres, ' ', c.apellidos) AS cliente,
       CONCAT(v.nombres, ' ', v.apellidos) AS vendedor
     FROM tb_pedidos p
     INNER JOIN tb_usuarios c
       ON p.cliente_documento = c.numero_documento
     INNER JOIN tb_usuarios v
       ON p.vendedor_documento = v.numero_documento
     ${where}
     ORDER BY p.fecha_pedido DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    [...parametros, limit, offset]
  );

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    pedidos
  };
};

const getPedidoById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       p.*,
       CONCAT(c.nombres, ' ', c.apellidos) AS cliente,
       CONCAT(v.nombres, ' ', v.apellidos) AS vendedor
     FROM tb_pedidos p
     INNER JOIN tb_usuarios c
       ON p.cliente_documento = c.numero_documento
     INNER JOIN tb_usuarios v
       ON p.vendedor_documento = v.numero_documento
     WHERE p.id = ?`,
    [id]
  );

  return rows[0] || null;
};

const getProductosPedido = async (pedidoId) => {
  const [rows] = await db.query(
    `SELECT
       d.id,
       d.producto_id,
       pr.nombre AS producto,
       d.cantidad,
       d.valor_unitario,
       d.cantidad * d.valor_unitario AS subtotal
     FROM tb_detalle_pedido_productos d
     INNER JOIN tb_productos pr
       ON d.producto_id = pr.id
     WHERE d.pedido_id = ?
     ORDER BY d.id`,
    [pedidoId]
  );

  return rows;
};

const getServiciosPedido = async (pedidoId) => {
  const [rows] = await db.query(
    `SELECT
       d.id,
       d.servicio_codigo,
       s.nombre AS servicio,
       d.cantidad,
       d.valor_unitario,
       d.cantidad * d.valor_unitario AS subtotal
     FROM tb_detalle_pedido_servicios d
     INNER JOIN tb_servicios s
       ON d.servicio_codigo = s.codigo
     WHERE d.pedido_id = ?
     ORDER BY d.id`,
    [pedidoId]
  );

  return rows;
};

const getDetallePedido = async (id) => {
  const pedido = await getPedidoById(id);

  if (!pedido) return null;

  const [productos, servicios] = await Promise.all([
    getProductosPedido(id),
    getServiciosPedido(id)
  ]);

  return {
    ...pedido,
    productos,
    servicios
  };
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  getProductosPedido,
  getServiciosPedido,
  getDetallePedido
};
