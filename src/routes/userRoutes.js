const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta usuarios
router.get('/users', userController.getAllUsers);
router.post('/users', userController.registerUser);
router.put('/users/:id', userController.updateUser);


module.exports = router;