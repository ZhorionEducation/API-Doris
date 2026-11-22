const repository = require('../repositories/shoppingRepository');
// este archivo de servicio se encarga de la logica de negocio para obtener todas las compras, llamando a la funcion del repositorio que se encarga de la consulta a la base de datos

const getAllShopping = async (page, limit) => {
    return await repository.getAllShopping(page, limit);
}


const registerShopping = async (shoppingData) => {
    return await repository.registerShopping(shoppingData);
}
module.exports = {
    getAllShopping,
    registerShopping
};