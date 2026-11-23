
const db = require('../config/db'); // Tenemos el config db

const getAllPedidos = async (page = 1, limit = 10, filtros = {}) => { // Tenemos la parte del async
  const condiciones = []; // Tenemos dos arreglos vacios
  const parametros = []; // Este es el segundo arreglo vacio

  if (filtros.cliente_documento) { // Aqui lo que se hace basicamente es que se filtra por medio del documento
    condiciones.push('p.cliente_documento = ?'); // Teenemos el push, que en este caso seria el enviar
    parametros.push(filtros.cliente_documento); // Tenemos tambien la parte de los parametros, que tambien se complementa por medio del push, es decir, se envia como tal
  }

  if (filtros.estado) { // Tenemos el filtrar por estado
    condiciones.push('p.estado = ?'); // Aqui tambien tenemos el push de condiciones
    parametros.push(filtros.estado); // Tenemos los parametros del estado y tambien tiene el push
  }

  if (filtros.fecha_inicio) { // Aqui tenemos filtros de la fecha de inicio
    condiciones.push('p.fecha_pedido >= ?'); // Tenemos aqui el push, que en este caso es el enviar de condiciones
    parametros.push(filtros.fecha_inicio); // Tenemos la parte de los parametros con el push, que en este caso el push es para enviar
  }

  if (filtros.fecha_fin) { // Aqui tenemos la filtracion de le fecha final
    condiciones.push('p.fecha_pedido <= ?'); // Y aqui pasa lo mismo tenemos las condiciones y los parametros y el push, que en este caso es para enviar
    parametros.push(filtros.fecha_fin);
  }

  const where = condiciones.length // Aqui tenemos la parte del length, que en este caso lo que pasa aqui es que el length es para saber la cantidad de elementos que hay en el arreglo, y si es mayor a 0, entonces se hace un join con AND, y si no, entonces no se hace nada 
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
