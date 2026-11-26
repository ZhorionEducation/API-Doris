
const express = require('express');
const router = express.Router();
const controller = require('../controllers/gestionProvedoresController');

// 1. Obtener categorías para el dropdown del formulario (debe ir antes de /:id)

// 2. Obtener todos los proveedores paginados
router.get('/proveedores', controller.getAllProveedores);

// 3. Obtener un solo proveedor por ID
router.get('/proveedores/:id', controller.getProveedorById);

// 4. Crear un nuevo proveedor
router.post('/proveedores', controller.registerProveedor);

// 5. Actualizar los datos de un provedor o cambiar  los estados 
router.patch('/proveedores/:id', controller.updateProveedor);


module.exports = router;