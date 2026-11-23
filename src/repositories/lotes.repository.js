
const db = require('../config/db');

// Obtener todos los lotes con su producto y proveedor
const getAllLotes = async () => {
    const [rows] = await db.query(`
        SELECT
            l.id,
            l.detalle_compra_id,
            l.numero_lote,
            DATE_FORMAT(l.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
            l.cantidad_disponible,
            dc.cantidad AS cantidad_comprada,
            dc.producto_id,
            p.nombre AS producto,
            dc.compra_id,
            c.proveedor_id,
            pr.razon_social AS proveedor
        FROM tb_lotes l
        INNER JOIN tb_detalle_compras dc
            ON l.detalle_compra_id = dc.id
        INNER JOIN tb_productos p
            ON dc.producto_id = p.id
        INNER JOIN tb_compras c
            ON dc.compra_id = c.id
        INNER JOIN tb_proveedores pr
            ON c.proveedor_id = pr.id
        ORDER BY l.id DESC
    `);

    return rows;
};

// Obtener un lote por su ID
const getLoteById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            l.id,
            l.detalle_compra_id,
            l.numero_lote,
            DATE_FORMAT(l.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
            l.cantidad_disponible,
            dc.cantidad AS cantidad_comprada,
            dc.producto_id,
            p.nombre AS producto,
            dc.compra_id,
            c.proveedor_id,
            pr.razon_social AS proveedor
        FROM tb_lotes l
        INNER JOIN tb_detalle_compras dc
            ON l.detalle_compra_id = dc.id
        INNER JOIN tb_productos p
            ON dc.producto_id = p.id
        INNER JOIN tb_compras c
            ON dc.compra_id = c.id
        INNER JOIN tb_proveedores pr
            ON c.proveedor_id = pr.id
        WHERE l.id = ?
    `, [id]);

    return rows[0] || null;
};

// Consultar un detalle de compra y su lote asociado
const getDetalleCompraById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            dc.id,
            dc.compra_id,
            dc.producto_id,
            dc.cantidad,
            c.estado AS estado_compra,
            l.id AS lote_id
        FROM tb_detalle_compras dc
        INNER JOIN tb_compras c
            ON dc.compra_id = c.id
        LEFT JOIN tb_lotes l
            ON l.detalle_compra_id = dc.id
        WHERE dc.id = ?
    `, [id]);

    return rows[0] || null;
};

// Registrar un lote
const registerLote = async (datos) => {
    const {
        detalle_compra_id,
        numero_lote,
        fecha_vencimiento,
        cantidad_disponible
    } = datos;

    const [result] = await db.query(`
        INSERT INTO tb_lotes (
            detalle_compra_id,
            numero_lote,
            fecha_vencimiento,
            cantidad_disponible
        )
        VALUES (?, ?, ?, ?)
    `, [
        detalle_compra_id,
        numero_lote,
        fecha_vencimiento,
        cantidad_disponible
    ]);

    return result.insertId;
};

// Actualizar un lote
const updateLote = async (id, datos) => {
    const {
        detalle_compra_id,
        numero_lote,
        fecha_vencimiento,
        cantidad_disponible
    } = datos;

    const [result] = await db.query(`
        UPDATE tb_lotes
        SET
            detalle_compra_id = ?,
            numero_lote = ?,
            fecha_vencimiento = ?,
            cantidad_disponible = ?
        WHERE id = ?
    `, [
        detalle_compra_id,
        numero_lote,
        fecha_vencimiento,
        cantidad_disponible,
        id
    ]);

    return result.affectedRows > 0;
};

// Eliminar un lote
const deleteLote = async (id) => {
    const [result] = await db.query(
        'DELETE FROM tb_lotes WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
};

// Obtener detalles de compras que todavía no tienen lote
const getDetallesDisponibles = async () => {
    const [rows] = await db.query(`
        SELECT
            dc.id,
            dc.compra_id,
            dc.producto_id,
            p.nombre AS producto,
            dc.cantidad,
            c.proveedor_id,
            pr.razon_social AS proveedor
        FROM tb_detalle_compras dc
        INNER JOIN tb_productos p
            ON dc.producto_id = p.id
        INNER JOIN tb_compras c
            ON dc.compra_id = c.id
        INNER JOIN tb_proveedores pr
            ON c.proveedor_id = pr.id
        LEFT JOIN tb_lotes l
            ON l.detalle_compra_id = dc.id
        WHERE l.id IS NULL
          AND c.estado = 'Recibida'
        ORDER BY dc.id DESC
    `);

    return rows;
};

module.exports = {
    getAllLotes,
    getLoteById,
    getDetalleCompraById,
    registerLote,
    updateLote,
    deleteLote,
    getDetallesDisponibles
};
