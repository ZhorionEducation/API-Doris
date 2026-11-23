const db = require('../config/db');

const getAllRoles = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_roles'
    );

    const [rows] = await db.query(
        `
        SELECT codigo, nombre, descripcion, estado
        FROM tb_roles
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

const getRoleByCode = async (codigo) => {
    const [rows] = await db.query(
        `
        SELECT codigo, nombre, descripcion, estado
        FROM tb_roles
        WHERE codigo = ?
        `,
        [codigo]
    );

    return rows[0] || null;
};

const registerRole = async (roleData) => {
    const {
        codigo,
        nombre,
        descripcion = null,
        estado = 'Activo'
    } = roleData;

    const [result] = await db.query(
        `
        INSERT INTO tb_roles (codigo, nombre, descripcion, estado)
        VALUES (?, ?, ?, ?)
        `,
        [codigo, nombre, descripcion, estado]
    );

    return result;
};

const updateRole = async (codigo, roleData) => {
    const { nombre, descripcion, estado } = roleData;

    const [result] = await db.query(
        `
        UPDATE tb_roles
        SET nombre = ?, descripcion = ?, estado = ?
        WHERE codigo = ?
        `,
        [nombre, descripcion ?? null, estado, codigo]
    );

    return result;
};

const deactivateRole = async (codigo) => {
    const [result] = await db.query(
        `
        UPDATE tb_roles
        SET estado = 'Inactivo'
        WHERE codigo = ?
        `,
        [codigo]
    );

    return result;
};

module.exports = {
    getAllRoles,
    getRoleByCode,
    registerRole,
    updateRole,
    deactivateRole
};
