const services = require('../services/ordersService');

const getAllOrders = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);
        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({ error: 'El parametro page debe ser un entero mayor o igual a 1' });
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'El parametro limit debe ser un entero entre 1 y 100' });
        }
        const result = await services.getAllOrders(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
};

module.exports = {
    getAllOrders
};