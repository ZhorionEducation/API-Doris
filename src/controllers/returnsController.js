const services = require('../services/returnServices');

/**
 * Campos que el cliente puede enviar al crear una devolución.
 * fecha_registro la establece la base de datos.
 * detalles contiene los renglones de productos devueltos.
 */
const camposCrear = [
    'pedido_id',
    'registra_documento',
    'motivo',
    'monto_reintegrado',
    'detalles'
];

/**
 * Campos que se pueden actualizar en el encabezado.
 * No se permite cambiar el pedido ni los detalles.
 */
const camposActualizar = ['motivo', 'monto_reintegrado'];

const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;

/**
 * Valida los renglones de productos que se devolverán.
 */
const validarDetalles = (detalles) => {
    if (!Array.isArray(detalles) || detalles.length === 0) {
        return 'El campo detalles debe ser un arreglo con al menos un producto';
    }

    const renglonesVistos = new Set();

    for (const [i, detalle] of detalles.entries()) {
        if (!detalle || typeof detalle !== 'object' || Array.isArray(detalle)) {
            return `detalles[${i}] debe ser un objeto`;
        }

        if (!esEnteroPositivo(detalle.detalle_pedido_producto_id)) {
            return `detalles[${i}].detalle_pedido_producto_id debe ser un entero mayor a 0`;
        }

        if (!esEnteroPositivo(detalle.cantidad)) {
            return `detalles[${i}].cantidad debe ser un entero mayor a 0`;
        }

        if (![true, false, 0, 1].includes(detalle.ajusta_stock)) {
            return `detalles[${i}].ajusta_stock debe ser true, false, 0 o 1`;
        }

        if (renglonesVistos.has(detalle.detalle_pedido_producto_id)) {
            return 'No repitas el mismo renglón del pedido en detalles';
        }

        renglonesVistos.add(detalle.detalle_pedido_producto_id);
    }

    return null;
};

/**
 * Valida los datos del encabezado y, al crear, sus detalles.
 */
const validarDevolucion = (data, { parcial = false } = {}) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'El cuerpo de la solicitud debe ser un objeto';
    }

    const permitidos = parcial ? camposActualizar : camposCrear;
    const camposRecibidos = Object.keys(data);

    if (parcial && camposRecibidos.length === 0) {
        return 'Debes enviar al menos un campo para actualizar';
    }

    const campoNoValido = camposRecibidos.find(
        (campo) => !permitidos.includes(campo)
    );

    if (campoNoValido) {
        return parcial
            ? `El campo ${campoNoValido} no se puede actualizar`
            : `El campo ${campoNoValido} no es válido`;
    }

    if (!parcial) {
        for (const campo of camposCrear) {
            if (data[campo] === undefined || data[campo] === null) {
                return `El campo ${campo} es obligatorio`;
            }
        }
    }

    for (const campo of camposRecibidos) {
        const valor = data[campo];

        if (valor === null) {
            return `El campo ${campo} no puede ser null`;
        }

        if (campo === 'pedido_id' && !esEnteroPositivo(valor)) {
            return 'El campo pedido_id debe ser un entero mayor a 0';
        }

        if (campo === 'registra_documento') {
            if (
                typeof valor !== 'string' ||
                !valor.trim() ||
                valor.trim().length > 20
            ) {
                return 'El campo registra_documento debe ser texto de 1 a 20 caracteres';
            }
        }

        if (campo === 'motivo') {
            if (
                typeof valor !== 'string' ||
                !valor.trim() ||
                valor.trim().length > 255
            ) {
                return 'El campo motivo debe ser texto de 1 a 255 caracteres';
            }
        }

        if (campo === 'monto_reintegrado') {
            if (
                typeof valor !== 'number' ||
                !Number.isFinite(valor) ||
                valor < 0 ||
                Math.round(valor * 100) / 100 !== valor
            ) {
                return 'El campo monto_reintegrado debe ser un número mayor o igual a 0 con máximo 2 decimales';
            }
        }

        if (campo === 'detalles') {
            const errorDetalles = validarDetalles(valor);
            if (errorDetalles) {
                return errorDetalles;
            }
        }
    }

    return null;
};

/**
 * Valida el ID recibido en la URL.
 */
const validarId = (id) => {
    const idNumerico = Number(id);

    return Number.isInteger(idNumerico) && idNumerico > 0
        ? idNumerico
        : null;
};

/**
 * Convierte errores del servicio o de la base de datos a respuestas HTTP.
 */
const manejarError = (res, error, mensajePorDefecto) => {
    if (error && Number.isInteger(error.status)) {
        return res.status(error.status).json({ error: error.message });
    }

    if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Alguno de los datos referenciados no existe (pedido, renglón o usuario)'
        });
    }

    console.error(`[devoluciones] ${mensajePorDefecto}:`, error);
    return res.status(500).json({ error: mensajePorDefecto });
};

/**
 * Obtiene devoluciones paginadas.
 */
const getAllDevoluciones = async (req, res) => {
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

    try {
        const result = await services.getAllDevoluciones(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al obtener devoluciones');
    }
};

/**
 * Registra una devolución con su encabezado y detalles.
 */
const registerDevolucion = async (req, res) => {
    const body = req.body;

    const data =
        body &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        req.user?.numero_documento
            ? { ...body, registra_documento: req.user.numero_documento }
            : body;

    const errorValidacion = validarDevolucion(data);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const result = await services.registerDevolucion(data);
        return res.status(201).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al registrar la devolución');
    }
};

/**
 * Busca una devolución por su ID.
 */
const getDevolucionById = async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: 'El id debe ser un entero mayor a 0'
        });
    }

    try {
        const result = await services.getDevolucionById(id);

        if (!result) {
            return res.status(404).json({
                error: 'No se encontró la devolución'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al obtener la devolución');
    }
};

/**
 * Actualiza únicamente motivo y/o monto_reintegrado.
 * El servicio debe devolver null si no existe la devolución con ese ID.
 */
const updateDevolucion = async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: 'El id debe ser un entero mayor a 0'
        });
    }

    const errorValidacion = validarDevolucion(req.body, { parcial: true });

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const result = await services.updateDevolucion(id, req.body);

        if (result === null) {
            return res.status(404).json({
                error: 'No se encontró la devolución'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al actualizar la devolución');
    }
};

module.exports = {
    getAllDevoluciones,
    registerDevolucion,
    getDevolucionById,
    updateDevolucion
};