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

const registerShopping = async (shoppingData) => {
    const {
        proveedor_id,
        encargado_documento,
        fecha_compra,
        fecha_entrega,
        bodega_destino,
        observaciones,
        estado = 'Pendiente',
        detalles,
        porcentaje_iva = 19
    } = shoppingData;

    if (!proveedor_id || !encargado_documento || !fecha_compra ||
        !fecha_entrega || !bodega_destino) {
        const error = new Error('Faltan datos obligatorios de la compra');
        error.statusCode = 400;
        throw error;
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
        const error = new Error('Debe incluir al menos un detalle de compra');
        error.statusCode = 400;
        throw error;
    }

    const fechaCompra = typeof fecha_compra === 'string'
        ? fecha_compra.slice(0, 10)
        : fecha_compra;
    const fechaEntrega = typeof fecha_entrega === 'string'
        ? fecha_entrega.slice(0, 10)
        : fecha_entrega;

    if (fechaEntrega < fechaCompra) {
        const error = new Error('La fecha de entrega no puede ser anterior a la fecha de compra');
        error.statusCode = 400;
        throw error;
    }

    const ivaPercentage = Number(porcentaje_iva);
    if (!Number.isFinite(ivaPercentage) || ivaPercentage < 0) {
        const error = new Error('El porcentaje de IVA debe ser un numero mayor o igual a 0');
        error.statusCode = 400;
        throw error;
    }

    const normalizedDetails = detalles.map((detalle) => {
        const productoId = Number(detalle.producto_id);
        const cantidad = Number(detalle.cantidad);
        const valorUnitario = Number(detalle.valor_unitario);

        if (!Number.isInteger(productoId) || productoId < 1) {
            const error = new Error('Cada detalle debe incluir un producto_id valido');
            error.statusCode = 400;
            throw error;
        }

        if (!Number.isInteger(cantidad) || cantidad < 1) {
            const error = new Error('Cada detalle debe incluir una cantidad entera mayor a 0');
            error.statusCode = 400;
            throw error;
        }

        if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
            const error = new Error('Cada detalle debe incluir un valor_unitario valido');
            error.statusCode = 400;
            throw error;
        }

        return { productoId, cantidad, valorUnitario };
    });

    const subtotal = normalizedDetails.reduce(
        (total, detalle) => total + (detalle.cantidad * detalle.valorUnitario),
        0
    );
    const iva = subtotal * (ivaPercentage / 100);
    const total = subtotal + iva;
    const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [shoppingResult] = await connection.query(
            `
            INSERT INTO tb_compras (
                proveedor_id,
                encargado_documento,
                fecha_compra,
                fecha_entrega,
                bodega_destino,
                subtotal,
                iva,
                total,
                observaciones,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                proveedor_id,
                encargado_documento,
                fechaCompra,
                fechaEntrega,
                bodega_destino,
                roundMoney(subtotal),
                roundMoney(iva),
                roundMoney(total),
                observaciones,
                estado
            ]
        );

        const compraId = shoppingResult.insertId;

        for (const detalle of normalizedDetails) {
            await connection.query(
                `
                INSERT INTO tb_detalle_compras (
                    compra_id,
                    producto_id,
                    cantidad,
                    valor_unitario
                ) VALUES (?, ?, ?, ?)
                `,
                [
                    compraId,
                    detalle.productoId,
                    detalle.cantidad,
                    roundMoney(detalle.valorUnitario)
                ]
            );
        }

        await connection.commit();

        return {
            compra_id: compraId,
            subtotal: roundMoney(subtotal),
            iva: roundMoney(iva),
            total: roundMoney(total),
            detalles_registrados: normalizedDetails.length
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllShopping,
    registerShopping
};