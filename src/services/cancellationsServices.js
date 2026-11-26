const repository = require('../repositories/cancellationsRepostirory');

/**
 * Obtiene anulaciones paginadas.
 */
const getAllAnulaciones = async (page, limit) => {
    return repository.getAllAnulaciones(page, limit);
};

/**
 * Busca una anulación por ID.
 */
const getAnulacionById = async (id) => {
    return repository.getAnulacionById(id);
};

/**
 * Registra una anulación.
 */
const registerAnulacion = async (anulacionData) => {
    return repository.registerAnulacion(anulacionData);
};

module.exports = {
    getAllAnulaciones,
    getAnulacionById,
    registerAnulacion
};