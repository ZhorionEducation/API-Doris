const services = require('../services/roleService');

const handleError = (res, error, fallbackMessage) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'El código o el nombre del rol ya está registrado'
        });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: fallbackMessage });
};

const getAllRoles = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                error: 'El parámetro page debe ser un entero mayor o igual a 1'
            });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'El parámetro limit debe ser un entero entre 1 y 100'
            });
        }

        const result = await services.getAllRoles(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al obtener los roles');
    }
};

const getRoleByCode = async (req, res) => {
    try {
        const role = await services.getRoleByCode(req.params.codigo);

        if (!role) {
            return res.status(404).json({ error: 'El rol no existe' });
        }

        return res.status(200).json(role);
    } catch (error) {
        return handleError(res, error, 'Error al obtener el rol');
    }
};

const registerRole = async (req, res) => {
    try {
        const result = await services.registerRole(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al registrar el rol');
    }
};

const updateRole = async (req, res) => {
    try {
        const result = await services.updateRole(req.params.codigo, req.body);

        if (!result) {
            return res.status(404).json({ error: 'El rol no existe' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al actualizar el rol');
    }
};

const deactivateRole = async (req, res) => {
    try {
        const result = await services.deactivateRole(req.params.codigo);

        if (!result) {
            return res.status(404).json({ error: 'El rol no existe' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al desactivar el rol');
    }
};

module.exports = {
    getAllRoles,
    getRoleByCode,
    registerRole,
    updateRole,
    deactivateRole
};