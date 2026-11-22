const services = require('../services/userService');

// este controlador se encarga de recibir la solicitud cuando se llama a todos los usuarios 
const getAllUsers = async (req, res) => {
    try {
        // creo variables de page y limit, si no se envian en la solicitud, se asignan valores por defecto (esto para evitar consultas muy grandes que puedan afectar el rendimiento del servidor)
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({ error: 'El parametro page debe ser un entero mayor o igual a 1' });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'El parametro limit debe ser un entero entre 1 y 100' });
        }

        const result = await services.getAllUsers(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

// este controlador se encarga de recibir la solicitud cuando se llama a registrar un usuario
const registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const result = await services.registerUser(userData);
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const sqlMessage = error.sqlMessage?.toLowerCase() || '';
            const duplicateField = sqlMessage.includes('email')
                ? 'correo electronico'
                : 'numero de documento';

            return res.status(409).json({
                error: `Ya existe un usuario con ese ${duplicateField}`
            });
        }

        res.status(500).json({ error: 'Error al registrar el usuario' });
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
        if (error.code === 'ER_DUP_ENTRY') {
            const sqlMessage = error.sqlMessage?.toLowerCase() || '';
            const duplicateField = sqlMessage.includes('email')
                ? 'correo electronico'
                : 'numero de documento';

            return res.status(409).json({
                error: `Ya existe un usuario con ese ${duplicateField}`
            });
        }

        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

module.exports = {
    getAllUsers,
    registerUser,
    updateUser
};