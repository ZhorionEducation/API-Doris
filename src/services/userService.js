const repository = require('../repositories/userRepository');
// este archivo de servicio se encarga de la logica de negocio para obtener todos los usuarios, llamando a la funcion del repositorio que se encarga de la consulta a la base de datos

// Función para obtener todos los usuarios
const getAllUsers = async (page, limit) => {
    return await repository.getAllUsers(page, limit);
};

// Función para registrar un nuevo usuario
const registerUser = async (userData) => {
    return await repository.registerUser(userData);
}

// Función para actualizar un usuario existente
const updateUser = async (userId, userData) => {
    return await repository.updateUser(userId, userData);
}

module.exports = {
    getAllUsers,
    registerUser,
    updateUser
};