const services = require('../services/productCategoryService');

const handleError = (res, error, fallbackMessage) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Ya existe una categoría de productos con ese nombre'
        });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: fallbackMessage });
};

const getAllProductCategories = async (req, res) => {
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

        const result = await services.getAllProductCategories(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al obtener las categorías de productos');
    }
};

const getProductCategoryById = async (req, res) => {
    try {
        const category = await services.getProductCategoryById(req.params.id);

        if (!category) {
            return res.status(404).json({
                error: 'La categoría de productos no existe'
            });
        }

        return res.status(200).json(category);
    } catch (error) {
        return handleError(res, error, 'Error al obtener la categoría de productos');
    }
};

const registerProductCategory = async (req, res) => {
    try {
        const result = await services.registerProductCategory(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al registrar la categoría de productos');
    }
};

const updateProductCategory = async (req, res) => {
    try {
        const result = await services.updateProductCategory(req.params.id, req.body);

        if (!result) {
            return res.status(404).json({
                error: 'La categoría de productos no existe'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al actualizar la categoría de productos');
    }
};

const deactivateProductCategory = async (req, res) => {
    try {
        const result = await services.deactivateProductCategory(req.params.id);

        if (!result) {
            return res.status(404).json({
                error: 'La categoría de productos no existe'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, 'Error al desactivar la categoría de productos');
    }
};

module.exports = {
    getAllProductCategories,
    getProductCategoryById,
    registerProductCategory,
    updateProductCategory,
    deactivateProductCategory
};