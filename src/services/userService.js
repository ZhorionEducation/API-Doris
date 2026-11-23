const repository = require('../repositories/userRepository');
// este archivo de servicio se encarga de la logica de negocio para obtener todos los usuarios, llamando a la funcion del repositorio que se encarga de la consulta a la base de datos


const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const handleDuplicateUserError = (error) => {
    if (error.code !== 'ER_DUP_ENTRY') {
        return error;
    }

    const sqlMessage = error.sqlMessage?.toLowerCase() || '';
    const duplicateField = sqlMessage.includes('email')
        ? 'correo electronico'
        : 'numero de documento';

    return createHttpError(
        409,
        `Ya existe un usuario con ese ${duplicateField}`
    );
};

// Función para obtener todos los usuarios
const getAllUsers = async (page, limit) => {
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

    return await repository.getAllUsers(normalizedPage, normalizedLimit);
};

// Función para registrar un nuevo usuario
const registerUser = async (userData) => {
    try {
        return await repository.registerUser(userData);
    } catch (error) {
        throw handleDuplicateUserError(error);
    }
};

// Función para actualizar un usuario existente
const updateUser = async (userId, userData) => {
    try {
        return await repository.updateUser(userId, userData);
    } catch (error) {
        throw handleDuplicateUserError(error);
    }
};

module.exports = {
    getAllUsers,
    registerUser,
    updateUser
};