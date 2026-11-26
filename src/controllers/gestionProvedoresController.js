const services = require('../services/gestionProvedoresServices');

const estadosValidos = ['Activo', 'Inactivo'];
const camposPermitidos = [
    'razon_social',
    'nit',
    'nombre_contacto',
    'email',
    'telefono',
    'direccion',
    'estado'
];
const camposObligatorios = ['razon_social', 'nit', 'estado'];

/**
 * Valida los datos de un proveedor.
 * En modo parcial, valida solo los campos enviados para una actualización PATCH.
 */
const validarProveedor = (data, { parcial = false } = {}) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'El cuerpo de la solicitud debe ser un objeto';
    }

    const camposRecibidos = Object.keys(data);

    if (parcial && camposRecibidos.length === 0) {
        return 'Debes enviar al menos un campo para actualizar';
    }

    const campoDesconocido = camposRecibidos.find(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (campoDesconocido) {
        return `El campo ${campoDesconocido} no se puede actualizar`;
    }

    if (!parcial) {
        for (const campo of camposObligatorios) {
            if (typeof data[campo] !== 'string' || !data[campo].trim()) {
                return `El campo ${campo} es obligatorio`;
            }
        }
    }

    for (const campo of camposRecibidos) {
        const valor = data[campo];

        if (valor === null && !camposObligatorios.includes(campo)) {
            continue;
        }

        if (typeof valor !== 'string' || !valor.trim()) {
            return `El campo ${campo} debe ser texto y no estar vacío`;
        }

        if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            return 'El formato del email no es válido';
        }

        if (campo === 'estado' && !estadosValidos.includes(valor)) {
            return 'El estado debe ser Activo o Inactivo';
        }
    }

    return null;
};

/**
 * Valida el ID recibido en la URL y lo devuelve como entero positivo.
 */
const validarId = (id) => {
    const idNumerico = Number(id);

    return Number.isInteger(idNumerico) && idNumerico > 0
        ? idNumerico
        : null;
};

/**
 * Obtiene todos los proveedores usando paginación.
 */
const getAllProveedores = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                error: 'El parametro page debe ser un entero mayor o igual a 1'
            });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'El parametro limit debe ser un entero entre 1 y 100'
            });
        }

        const result = await services.getAllProveedores(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

/**
 * Registra un proveedor después de validar los campos obligatorios y sus formatos.
 */
const registerProveedor = async (req, res) => {
    const errorValidacion = validarProveedor(req.body);
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const result = await services.registerProveedor(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error al registrar el proveedor' });
    }
};

/**
 * Busca un proveedor por ID y devuelve sus datos.
 */
const getProveedorById = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) {
        return res.status(400).json({
            error: 'El id debe ser un entero mayor a 0'
        });
    }

    try {
        const result = await services.getProveedorById(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
};

/**
 * Actualiza únicamente los campos enviados en la solicitud PATCH.
 */
const updateProveedor = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) {
        return res.status(400).json({
            error: 'El id debe ser un entero mayor a 0'
        });
    }

    const errorValidacion = validarProveedor(req.body, { parcial: true });
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const result = await services.updateProveedor(id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
};


module.exports = {
    getAllProveedores,
    registerProveedor,
    getProveedorById,
    updateProveedor
};