const db = require('../config/db');

/**
 * Obtiene las anulaciones paginadas y el total de registros.
 */
const getAllAnulaciones = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_anulaciones'
    );

    const [rows] = await db.query(
        `
        SELECT
            id,
            lote_id,
            registra_documento,
            cantidad,
            motivo,
            fecha_registro
        FROM tb_anulaciones
        ORDER BY id DESC
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

/**
 * Busca una anulación por ID.
 * Devuelve null si no existe.
 */
const getAnulacionById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            lote_id,
            registra_documento,
            cantidad,
            motivo,
            fecha_registro
        FROM tb_anulaciones
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
};

/**
 * Registra una anulación y devuelve el registro creado.
 * La fecha de registro usa el valor por defecto de la tabla.
 */
const registerAnulacion = async (anulacionData) => {
    const {
        lote_id,
        registra_documento,
        cantidad,
        motivo
    } = anulacionData;

    const [result] = await db.query(
        `
        INSERT INTO tb_anulaciones (
            lote_id,
            registra_documento,
            cantidad,
            motivo
        ) VALUES (?, ?, ?, ?)
        `,
        [lote_id, registra_documento, cantidad, motivo]
    );

    return getAnulacionById(result.insertId);
};

module.exports = {
    getAllAnulaciones,
    getAnulacionById,
    registerAnulacion
};x