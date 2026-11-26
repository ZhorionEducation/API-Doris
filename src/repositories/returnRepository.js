const db = require('../config/db');

const columnasActualizar = {
    motivo: 'motivo',
    monto_reintegrado: 'monto_reintegrado'
};

/**
 * Obtiene el encabezado y los detalles de una devolución.
 */
const obtenerDevolucion = async (executor, id) => {
    const [devoluciones] = await executor.query(
        `
        SELECT
            id,
            pedido_id,
            registra_documento,
            motivo,
            monto_reintegrado,
            fecha_registro
        FROM tb_devoluciones
        WHERE id = ?
        `,
        [id]
    );

    if (devoluciones.length === 0) {
        return null;
    }

    const [detalles] = await executor.query(
        `
        SELECT
            id,
            devolucion_id,
            detalle_pedido_producto_id,
            cantidad,
            ajusta_stock
        FROM tb_detalle_devoluciones
        WHERE devolucion_id = ?
        ORDER BY id ASC
        `,
        [id]
    );

    return {
        ...devoluciones[0],
        detalles
    };
};

/**
 * Obtiene devoluciones paginadas, incluyendo sus renglones de detalle.
 */
const getAllDevoluciones = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_devoluciones'
    );

    const [devoluciones] = await db.query(
        `
        SELECT
            id,
            pedido_id,
            registra_documento,
            motivo,
            monto_reintegrado,
            fecha_registro
        FROM tb_devoluciones
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
    );

    const ids = devoluciones.map((devolucion) => devolucion.id);
    let detalles = [];

    if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(', ');

        const [filasDetalle] = await db.query(
            `
            SELECT
                id,
                devolucion_id,
                detalle_pedido_producto_id,
                cantidad,
                ajusta_stock
            FROM tb_detalle_devoluciones
            WHERE devolucion_id IN (${placeholders})
            ORDER BY id ASC
            `,
            ids
        );

        detalles = filasDetalle;
    }

    const detallesPorDevolucion = new Map();

    for (const detalle of detalles) {
        if (!detallesPorDevolucion.has(detalle.devolucion_id)) {
            detallesPorDevolucion.set(detalle.devolucion_id, []);
        }

        detallesPorDevolucion.get(detalle.devolucion_id).push(detalle);
    }

    const total = Number(countRows[0].total);

    return {
        data: devoluciones.map((devolucion) => ({
            ...devolucion,
            detalles: detallesPorDevolucion.get(devolucion.id) || []
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Busca una devolución por ID, incluyendo sus detalles.
 */
const getDevolucionById = async (id) => {
    return obtenerDevolucion(db, id);
};

/**
 * Registra el encabezado y sus detalles en una sola transacción.
 */
const registerDevolucion = async (devolucionData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [resultado] = await connection.query(
            `
            INSERT INTO tb_devoluciones (
                pedido_id,
                registra_documento,
                motivo,
                monto_reintegrado
            ) VALUES (?, ?, ?, ?)
            `,
            [
                devolucionData.pedido_id,
                devolucionData.registra_documento,
                devolucionData.motivo,
                devolucionData.monto_reintegrado
            ]
        );

        const devolucionId = resultado.insertId;

        for (const detalle of devolucionData.detalles) {
            await connection.query(
                `
                INSERT INTO tb_detalle_devoluciones (
                    devolucion_id,
                    detalle_pedido_producto_id,
                    cantidad,
                    ajusta_stock
                ) VALUES (?, ?, ?, ?)
                `,
                [
                    devolucionId,
                    detalle.detalle_pedido_producto_id,
                    detalle.cantidad,
                    detalle.ajusta_stock ? 1 : 0
                ]
            );
        }

        const devolucion = await obtenerDevolucion(connection, devolucionId);

        await connection.commit();
        return devolucion;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Actualiza motivo y/o monto_reintegrado.
 * Devuelve null si el ID no existe.
 */
const updateDevolucion = async (id, devolucionData) => {
    const campos = Object.keys(devolucionData);

    if (campos.length === 0) {
        throw new Error('Debes enviar al menos un campo para actualizar');
    }

    const campoNoPermitido = campos.find(
        (campo) => !Object.prototype.hasOwnProperty.call(columnasActualizar, campo)
    );

    if (campoNoPermitido) {
        throw new Error(`El campo ${campoNoPermitido} no se puede actualizar`);
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [devoluciones] = await connection.query(
            'SELECT id FROM tb_devoluciones WHERE id = ? FOR UPDATE',
            [id]
        );

        if (devoluciones.length === 0) {
            await connection.rollback();
            return null;
        }

        const asignaciones = campos
            .map((campo) => `${columnasActualizar[campo]} = ?`)
            .join(', ');
        const valores = campos.map((campo) => devolucionData[campo]);
        valores.push(id);

        await connection.query(
            `UPDATE tb_devoluciones SET ${asignaciones} WHERE id = ?`,
            valores
        );

        const devolucion = await obtenerDevolucion(connection, id);

        await connection.commit();
        return devolucion;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllDevoluciones,
    getDevolucionById,
    registerDevolucion,
    updateDevolucion
};