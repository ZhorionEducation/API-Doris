const services = require('../services/shoppingService');

const getAllShoppiing = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);

        const result = await services.getAllShopping(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.statusCode
                ? error.message
                : 'Error al obtener las compras'
        });
    }
};

const registerShopping = async (req, res) => {
    try {
        const shoppingData = req.body;
        const result = await services.registerShopping(shoppingData);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.statusCode
                ? error.message
                : 'Error al registrar la compra'
        });
    }
};

module.exports = {
    getAllShoppiing,
    registerShopping
};