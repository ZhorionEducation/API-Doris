const services = require('../services/serviceSupplyService');

const handleError = (res, error, fallbackMessage) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Ya existe un insumo registrado para ese servicio y producto'
        });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'El servicio o el producto indicado no existe'
        });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: fallbackMessage });
};

const getAllServiceSupplies = async (req, res) => {
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

        const result = await services.getAllServiceSupplies(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al obtener los insumos de servicios');
    }
};

const getServiceSupplyById = async (req, res) => {
    try {
        const supply = await services.getServiceSupplyById(req.params.id);

        if (!supply) {
            return res.status(404).json({ error: 'El insumo de servicio no existe' });
        }

        return res.status(200).json(supply);
    } catch (error) {
        return handleError(res, error, 'Error al obtener el insumo de servicio');
    }
};

const registerServiceSupply = async (req, res) => {
    try {
        const result = await services.registerServiceSupply(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al registrar el insumo de servicio');
    }
};

const updateServiceSupply = async (req, res) => {
    try {
        const result = await services.updateServiceSupply(req.params.id, req.body);

        if (!result) {
            return res.status(404).json({ error: 'El insumo de servicio no existe' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al actualizar el insumo de servicio');
    }
};

const deactivateServiceSupply = async (req, res) => {
    try {
        const result = await services.deactivateServiceSupply(req.params.id);

        if (!result) {
            return res.status(404).json({ error: 'El insumo de servicio no existe' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al desactivar el insumo de servicio');
    }
};

module.exports = {
    getAllServiceSupplies,
    getServiceSupplyById,
    registerServiceSupply,
    updateServiceSupply,
    deactivateServiceSupply
};