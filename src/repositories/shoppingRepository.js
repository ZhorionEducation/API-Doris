const db = require('../config/db');

// Función para obtener todas las compras
const getAllShopping = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM tb_compras
        `
    );

    const [rows] = await db.query(
        `
        SELECT
            c.id,
            c.proveedor_id,
            c.encargado_documento,
            c.fecha_compra,
            c.fecha_entrega,
            c.bodega_destino,
            c.subtotal,
            c.iva,
            c.total,
            c.observaciones,
            c.estado
        FROM tb_compras c
        ORDER BY c.fecha_compra DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
    );

    const total = Number(countRows[0].total);

    return {
        data: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    getAllShopping
};