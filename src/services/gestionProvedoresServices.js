const repository = require('../repositories/GestionProvRepository');

// 1. Obtener todos los proveedores paginados
const getAllProveedores = async (page, limit) => {
    return await repository.getAllProveedores(page, limit);
};

// 2. Obtener un proveedor por su ID
const getProveedorById = async (id) => {
    return await repository.getProveedorById(id);
};

// 3. Registrar un nuevo proveedor
const registerProveedor = async (proveedorData) => {
    return await repository.registerProveedor(proveedorData);
};

// 4. Actualizar los campos enviados del proveedor, incluido el estado
const updateProveedor = async (id, proveedorData) => {
    return await repository.updateProveedor(id, proveedorData);
};




module.exports = {
    getAllProveedores,
    getProveedorById,
    registerProveedor,
    updateProveedor

    
};