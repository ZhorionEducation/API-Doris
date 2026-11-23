const express = require('express');
const router = express.Router();
const controller = require('../controllers/roleController');

router.get('/roles', controller.getAllRoles);
router.get('/roles/:codigo', controller.getRoleByCode);
router.post('/roles', controller.registerRole);
router.put('/roles/:codigo', controller.updateRole);
router.delete('/roles/:codigo', controller.deactivateRole);

module.exports = router;