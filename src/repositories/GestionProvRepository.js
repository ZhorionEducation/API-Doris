const db = require('../config/db');

/**
 * Obtiene todos los proveedores paginados y el total de registros.
 */
const getAllProveedores = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_proveedores'
    );

    const [rows] = await db.query(
        `
        SELECT
            id,
            razon_social,
            nit,
            nombre_contacto,
            email,
            telefono,
            direccion,
            estado
        FROM tb_proveedores
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

/**
 * Busca un proveedor por su ID.
 * Devuelve null si no encuentra coincidencias.
 */
const getProveedorById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            razon_social,
            nit,
            nombre_contacto,
            email,
            telefono,
            direccion,
            estado
        FROM tb_proveedores
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
};

/**
 * Inserta un proveedor nuevo.
 * Los campos opcionales que no se envíen se guardan como null.
 */
const registerProveedor = async (proveedorData) => {
    const {
        razon_social,
        nit,
        nombre_contacto,
        email,
        telefono,
        direccion,
        estado
    } = proveedorData;

    const [result] = await db.query(
        `
        INSERT INTO tb_proveedores (
            razon_social,
            nit,
            nombre_contacto,
            email,
            telefono,
            direccion,
            estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            razon_social,
            nit,
            nombre_contacto ?? null,
            email ?? null,
            telefono ?? null,
            direccion ?? null,
            estado
        ]
    );

    return result;
};

/**
 * Actualiza únicamente los campos permitidos que se hayan enviado.
 */
const updateProveedor = async (id, proveedorData) => {
    const columnasPermitidas = {
        razon_social: 'razon_social',
        nit: 'nit',
        nombre_contacto: 'nombre_contacto',
        email: 'email',
        telefono: 'telefono',
        direccion: 'direccion',
        estado: 'estado'
    };

    if (
        !proveedorData ||
        typeof proveedorData !== 'object' ||
        Array.isArray(proveedorData)
    ) {
        throw new Error('Los datos del proveedor deben ser un objeto');
    }

    const campos = Object.keys(proveedorData);

    if (campos.length === 0) {
        throw new Error('Debes enviar al menos un campo para actualizar');
    }

    const campoNoPermitido = campos.find(
        (campo) => !Object.prototype.hasOwnProperty.call(columnasPermitidas, campo)
    );

    if (campoNoPermitido) {
        throw new Error(`El campo ${campoNoPermitido} no se puede actualizar`);
    }

    const asignaciones = campos
        .map((campo) => `${columnasPermitidas[campo]} = ?`)
        .join(', ');

    const valores = campos.map((campo) => proveedorData[campo]);
    valores.push(id);

    const [result] = await db.query(
        `UPDATE tb_proveedores SET ${asignaciones} WHERE id = ?`,
        valores
    );

    return result;
};

module.exports = {
    getAllProveedores,
    getProveedorById,
    registerProveedor,
    updateProveedor
};