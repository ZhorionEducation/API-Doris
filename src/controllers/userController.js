const services = require('../services/userService');

// este controlador se encarga de recibir la solicitud cuando se llama a todos los usuarios 
const getAllUsers = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 50;

        const result = await services.getAllUsers(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.statusCode
                ? error.message
                : 'Error al obtener los usuarios'
        });
    }
};

// este controlador se encarga de recibir la solicitud cuando se llama a registrar un usuario
const registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const result = await services.registerUser(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.statusCode
                ? error.message
                : 'Error al registrar el usuario'
        });
    }
};

// este controlador se encarga de recibir la solicitud cuando se llama a actualizar un usuario
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;
        const result = await services.updateUser(userId, userData);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.statusCode
                ? error.message
                : 'Error al actualizar el usuario'
        });
    }
};

module.exports = {
    getAllUsers,
    registerUser,
    updateUser
};