const repository = require('../repositories/shoppingRepository');
// este archivo de servicio se encarga de la logica de negocio para obtener todas las compras, llamando a la funcion del repositorio que se encarga de la consulta a la base de datos

const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}


const getAllShopping = async (page, limit) => {
    const normalizedPage = Number(page);
    const normalizedLimit = Number(limit);

    if (!Number.isInteger(normalizedPage) || normalizedPage < 1) {
        throw createHttpError(
            400,
            'La pagina debe ser un entero mayor o igual a 1'
        );
    }

    if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1 || normalizedLimit > 100) {
        throw createHttpError(
            400,
            'El limite debe ser un entero entre 1 y 100'
        );
    }

    return await repository.getAllShopping(page, limit);
}


const registerShopping = async (shoppingData) => {
    try {
        return await repository.registerShopping(shoppingData);
    } catch (error) {
        throw error;
    }
}
module.exports = {
    getAllShopping,
    registerShopping
};