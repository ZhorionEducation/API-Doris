const repository = require('../repositories/returnRepository');

/**
 * Obtiene devoluciones paginadas.
 */
const getAllDevoluciones = async (page, limit) => {
    return repository.getAllDevoluciones(page, limit);
};

/**
 * Obtiene una devolución por ID, con sus detalles.
 */
const getDevolucionById = async (id) => {
    return repository.getDevolucionById(id);
};

/**
 * Registra el encabezado y los detalles de una devolución.
 */
const registerDevolucion = async (devolucionData) => {
    return repository.registerDevolucion(devolucionData);
};

/**
 * Actualiza los campos permitidos de una devolución.
 */
const updateDevolucion = async (id, devolucionData) => {
    return repository.updateDevolucion(id, devolucionData);
};

module.exports = {
    getAllDevoluciones,
    getDevolucionById,
    registerDevolucion,
    updateDevolucion
};