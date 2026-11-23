const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');

router.get('/services', controller.getAllServices);
router.get('/services/:codigo', controller.getServiceByCode);
router.post('/services', controller.registerService);
router.put('/services/:codigo', controller.updateService);
router.delete('/services/:codigo', controller.deactivateService);

module.exports = router;