const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceSupplyController');

router.get('/service-supplies', controller.getAllServiceSupplies);
router.get('/service-supplies/:id', controller.getServiceSupplyById);
router.post('/service-supplies', controller.registerServiceSupply);
router.put('/service-supplies/:id', controller.updateServiceSupply);
router.delete('/service-supplies/:id', controller.deactivateServiceSupply);

module.exports = router;