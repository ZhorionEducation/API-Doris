const db = require('../config/db');

const getAllServices = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_servicios'
    );

    const [rows] = await db.query(
        `
        SELECT
            codigo,
            categoria_id,
            nombre,
            duracion_minutos,
            precio_base,
            descuento,
            descripcion,
            observaciones,
            estado
        FROM tb_servicios
        ORDER BY codigo ASC
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

const getServiceByCode = async (codigo) => {
    const [rows] = await db.query(
        `
        SELECT
            codigo,
            categoria_id,
            nombre,
            duracion_minutos,
            precio_base,
            descuento,
            descripcion,
            observaciones,
            estado
        FROM tb_servicios
        WHERE codigo = ?
        `,
        [codigo]
    );

    return rows[0] || null;
};

const registerService = async (serviceData) => {
    const {
        codigo,
        categoria_id,
        nombre,
        duracion_minutos,
        precio_base,
        descuento,
        descripcion,
        observaciones,
        estado
    } = serviceData;

    const [result] = await db.query(
        `
        INSERT INTO tb_servicios (
            codigo,
            categoria_id,
            nombre,
            duracion_minutos,
            precio_base,
            descuento,
            descripcion,
            observaciones,
            estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            codigo,
            categoria_id,
            nombre,
            duracion_minutos,
            precio_base,
            descuento,
            descripcion,
            observaciones,
            estado
        ]
    );

    return result;
};

const updateService = async (codigo, serviceData) => {
    const {
        categoria_id,
        nombre,
        duracion_minutos,
        precio_base,
        descuento,
        descripcion,
        observaciones,
        estado
    } = serviceData;

    const [result] = await db.query(
        `
        UPDATE tb_servicios
        SET
            categoria_id = ?,
            nombre = ?,
            duracion_minutos = ?,
            precio_base = ?,
            descuento = ?,
            descripcion = ?,
            observaciones = ?,
            estado = ?
        WHERE codigo = ?
        `,
        [
            categoria_id,
            nombre,
            duracion_minutos,
            precio_base,
            descuento,
            descripcion,
            observaciones,
            estado,
            codigo
        ]
    );

    return result;
};

const deactivateService = async (codigo) => {
    const [result] = await db.query(
        `
        UPDATE tb_servicios
        SET estado = 'Inactivo'
        WHERE codigo = ?
        `,
        [codigo]
    );

    return result;
};

module.exports = {
    getAllServices,
    getServiceByCode,
    registerService,
    updateService,
    deactivateService
};