const db = require('../config/db');

const getAllServiceSupplies = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_insumos_servicios'
    );

    const [rows] = await db.query(
        `
        SELECT
            id,
            servicio_codigo,
            producto_id,
            cantidad,
            observaciones,
            estado
        FROM tb_insumos_servicios
        ORDER BY id ASC
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

const getServiceSupplyById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            servicio_codigo,
            producto_id,
            cantidad,
            observaciones,
            estado
        FROM tb_insumos_servicios
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
};

const registerServiceSupply = async (supplyData) => {
    const {
        servicio_codigo,
        producto_id,
        cantidad,
        observaciones,
        estado
    } = supplyData;

    const [result] = await db.query(
        `
        INSERT INTO tb_insumos_servicios (
            servicio_codigo,
            producto_id,
            cantidad,
            observaciones,
            estado
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [servicio_codigo, producto_id, cantidad, observaciones, estado]
    );

    return result;
};

const updateServiceSupply = async (id, supplyData) => {
    const {
        servicio_codigo,
        producto_id,
        cantidad,
        observaciones,
        estado
    } = supplyData;

    const [result] = await db.query(
        `
        UPDATE tb_insumos_servicios
        SET
            servicio_codigo = ?,
            producto_id = ?,
            cantidad = ?,
            observaciones = ?,
            estado = ?
        WHERE id = ?
        `,
        [servicio_codigo, producto_id, cantidad, observaciones, estado, id]
    );

    return result;
};

const deactivateServiceSupply = async (id) => {
    const [result] = await db.query(
        `
        UPDATE tb_insumos_servicios
        SET estado = 'Inactivo'
        WHERE id = ?
        `,
        [id]
    );

    return result;
};

module.exports = {
    getAllServiceSupplies,
    getServiceSupplyById,
    registerServiceSupply,
    updateServiceSupply,
    deactivateServiceSupply
};