
const services = require('../services/lotes.service');

// Manejar errores de la API
const manejarError = (error, res, mensaje) => {
    if (error.status) {
        return res.status(error.status).json({
            error: error.message
        });
    }

    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'El detalle de compra ya está asociado a un lote'
        });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(409).json({
            error: 'El registro relacionado no existe'
        });
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
            error: 'No se puede eliminar porque existen registros relacionados'
        });
    }

    console.error(mensaje, error);

    return res.status(500).json({
        error: mensaje
    });
};

// Obtener todos los lotes
const getAllLotes = async (req, res) => {
    try {
        const result = await services.getAllLotes();

        res.status(200).json(result);
    } catch (error) {
        manejarError(error, res, 'Error al obtener los lotes');
    }
};

// Obtener lote por ID
const getLoteById = async (req, res) => {
    try {
        const result = await services.getLoteById(req.params.id);

        if (!result) {
            return res.status(404).json({
                error: 'Lote no encontrado'
            });
        }

        res.status(200).json(result);
    } catch (error) {
        manejarError(error, res, 'Error al consultar el lote');
    }
};

// Registrar un lote
const registerLote = async (req, res) => {
    try {
        const result = await services.registerLote(req.body);

        res.status(201).json({
            mensaje: 'Lote registrado correctamente',
            lote: result
        });
    } catch (error) {
        manejarError(error, res, 'Error al registrar el lote');
    }
};

// Actualizar un lote
const updateLote = async (req, res) => {
    try {
        const result = await services.updateLote(
            req.params.id,
            req.body
        );

        if (!result) {
            return res.status(404).json({
                error: 'Lote no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Lote actualizado correctamente',
            lote: result
        });
    } catch (error) {
        manejarError(error, res, 'Error al actualizar el lote');
    }
};

// Eliminar un lote
const deleteLote = async (req, res) => {
    try {
        const result = await services.deleteLote(req.params.id);

        if (!result) {
            return res.status(404).json({
                error: 'Lote no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Lote eliminado correctamente'
        });
    } catch (error) {
        manejarError(error, res, 'Error al eliminar el lote');
    }
};

// Consultar detalles de compras disponibles
const getDetallesDisponibles = async (req, res) => {
    try {
        const result = await services.getDetallesDisponibles();

        res.status(200).json(result);
    } catch (error) {
        manejarError(
            error,
            res,
            'Error al consultar los detalles de compras'
        );
    }
};

module.exports = {
    getAllLotes,
    getLoteById,
    registerLote,
    updateLote,
    deleteLote,
    getDetallesDisponibles
};
