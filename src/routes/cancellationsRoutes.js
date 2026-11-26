const express = require('express');
const router = express.Router();
const controller = require('../controllers/cancellationsController');

router.get('/anulaciones', controller.getAllAnulaciones);
router.get('/anulaciones/:id', controller.getAnulacionById);
router.post('/anulaciones', controller.registerAnulacion);

module.exports = router;