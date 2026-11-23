const services = require('../services/serviceService');

const handleError = (res, error, fallbackMessage) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Ya existe un servicio con ese código'
        });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'La categoría de servicios indicada no existe'
        });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: fallbackMessage });
};

const getAllServices = async (req, res) => {
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

        const result = await services.getAllServices(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al obtener los servicios');
    }
};

const getServiceByCode = async (req, res) => {
    try {
        const service = await services.getServiceByCode(req.params.codigo);

        if (!service) {
            return res.status(404).json({ error: 'El servicio no existe' });
        }

        return res.status(200).json(service);
    } catch (error) {
        return handleError(res, error, 'Error al obtener el servicio');
    }
};

const registerService = async (req, res) => {
    try {
        const result = await services.registerService(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al registrar el servicio');
    }
};

const updateService = async (req, res) => {
    try {
        const result = await services.updateService(req.params.codigo, req.body);

        if (!result) {
            return res.status(404).json({ error: 'El servicio no existe' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al actualizar el servicio');
    }
};

const deactivateService = async (req, res) => {
    try {
        const result = await services.deactivateService(req.params.codigo);

        if (!result) {
            return res.status(404).json({ error: 'El servicio no existe' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al desactivar el servicio');
    }
};

module.exports = {
    getAllServices,
    getServiceByCode,
    registerService,
    updateService,
    deactivateService
};