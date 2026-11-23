const db = require('../config/db');

const getAllProductCategories = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_categorias_productos'
    );

    const [rows] = await db.query(
        `
        SELECT id, nombre, descripcion, estado
        FROM tb_categorias_productos
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

const getProductCategoryById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT id, nombre, descripcion, estado
        FROM tb_categorias_productos
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
};

const registerProductCategory = async (categoryData) => {
    const { nombre, descripcion = null, estado = 'Activo' } = categoryData;

    const [result] = await db.query(
        `
        INSERT INTO tb_categorias_productos (nombre, descripcion, estado)
        VALUES (?, ?, ?)
        `,
        [nombre, descripcion, estado]
    );

    return result;
};

const updateProductCategory = async (id, categoryData) => {
    const { nombre, descripcion, estado } = categoryData;

    const [result] = await db.query(
        `
        UPDATE tb_categorias_productos
        SET nombre = ?, descripcion = ?, estado = ?
        WHERE id = ?
        `,
        [nombre, descripcion ?? null, estado, id]
    );

    return result;
};

const deactivateProductCategory = async (id) => {
    const [result] = await db.query(
        `
        UPDATE tb_categorias_productos
        SET estado = 'Inactivo'
        WHERE id = ?
        `,
        [id]
    );

    return result;
};

module.exports = {
    getAllProductCategories,
    getProductCategoryById,
    registerProductCategory,
    updateProductCategory,
    deactivateProductCategory
};