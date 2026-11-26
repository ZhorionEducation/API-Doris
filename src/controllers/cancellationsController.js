const services = require('../services/cancellationsServices');

const camposCrear = [
    'lote_id',
    'registra_documento',
    'cantidad',
    'motivo'
];

/**
 * Valida los datos para registrar una anulación.
 */
const validarAnulacion = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'El cuerpo de la solicitud debe ser un objeto';
    }

    const campoNoPermitido = Object.keys(data).find(
        (campo) => !camposCrear.includes(campo)
    );

    if (campoNoPermitido) {
        return `El campo ${campoNoPermitido} no es válido`;
    }

    for (const campo of camposCrear) {
        if (data[campo] === undefined || data[campo] === null) {
            return `El campo ${campo} es obligatorio`;
        }
    }

    if (
        !Number.isInteger(data.lote_id) ||
        data.lote_id < 1 ||
        data.lote_id > 2147483647
    ) {
        return 'El campo lote_id debe ser un entero positivo';
    }

    if (
        !Number.isInteger(data.cantidad) ||
        data.cantidad < 1 ||
        data.cantidad > 4294967295
    ) {
        return 'El campo cantidad debe ser un entero positivo';
    }

    if (
        typeof data.registra_documento !== 'string' ||
        !data.registra_documento.trim() ||
        data.registra_documento.trim().length > 20
    ) {
        return 'El campo registra_documento debe tener entre 1 y 20 caracteres';
    }

    if (
        typeof data.motivo !== 'string' ||
        !data.motivo.trim() ||
        data.motivo.trim().length > 255
    ) {
        return 'El campo motivo debe tener entre 1 y 255 caracteres';
    }

    return null;
};

/**
 * Valida un ID entero positivo recibido en la URL.
 */
const validarId = (id) => {
    const idNumerico = Number(id);

    return Number.isInteger(idNumerico) && idNumerico > 0
        ? idNumerico
        : null;
};

/**
 * Traduce errores del servicio o de la base de datos a respuestas HTTP.
 */
const manejarError = (res, error, mensajePorDefecto) => {
    if (error && Number.isInteger(error.status)) {
        return res.status(error.status).json({ error: error.message });
    }

    if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'El lote o el usuario indicado no existe'
        });
    }

    console.error(`[anulaciones] ${mensajePorDefecto}:`, error);
    return res.status(500).json({ error: mensajePorDefecto });
};

/**
 * Obtiene anulaciones paginadas.
 */
const getAllAnulaciones = async (req, res) => {
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
        const result = await services.getAllAnulaciones(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al obtener anulaciones');
    }
};

/**
 * Busca una anulación por ID.
 */
const getAnulacionById = async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: 'El id debe ser un entero mayor a 0'
        });
    }

    try {
        const result = await services.getAnulacionById(id);

        if (!result) {
            return res.status(404).json({
                error: 'No se encontró la anulación'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al obtener la anulación');
    }
};

/**
 * Registra una anulación. La fecha la asigna la base de datos.
 */
const registerAnulacion = async (req, res) => {
    const body = req.body;

    const data =
        body &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        req.user?.numero_documento
            ? { ...body, registra_documento: req.user.numero_documento }
            : body;

    const errorValidacion = validarAnulacion(data);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const result = await services.registerAnulacion(data);
        return res.status(201).json(result);
    } catch (error) {
        return manejarError(res, error, 'Error al registrar la anulación');
    }
};

module.exports = {
    getAllAnulaciones,
    getAnulacionById,
    registerAnulacion
};