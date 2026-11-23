const repository = require('../repositories/productCategoryRepository');

const validationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const normalizeId = (id) => {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
        throw validationError('El id debe ser un entero mayor o igual a 1');
    }

    return parsedId;
};

const validateCategoryData = (categoryData, isUpdate = false) => {
    if (
        !categoryData ||
        typeof categoryData !== 'object' ||
        Array.isArray(categoryData)
    ) {
        throw validationError('El cuerpo de la solicitud debe ser un objeto');
    }

    const nombre = typeof categoryData.nombre === 'string'
        ? categoryData.nombre.trim()
        : '';

    if (!nombre || nombre.length > 80) {
        throw validationError('El nombre es obligatorio y debe tener máximo 80 caracteres');
    }

    const descripcion = categoryData.descripcion ?? null;

    if (
        descripcion !== null &&
        (typeof descripcion !== 'string' || descripcion.length > 255)
    ) {
        throw validationError('La descripción debe tener máximo 255 caracteres');
    }

    const estado = categoryData.estado === undefined && !isUpdate
        ? 'Activo'
        : categoryData.estado;

    if (!['Activo', 'Inactivo'].includes(estado)) {
        throw validationError('El estado debe ser Activo o Inactivo');
    }

    return { nombre, descripcion, estado };
};

const getAllProductCategories = async (page, limit) => {
    return repository.getAllProductCategories(page, limit);
};

const getProductCategoryById = async (id) => {
    return repository.getProductCategoryById(normalizeId(id));
};

const registerProductCategory = async (categoryData) => {
    const normalizedData = validateCategoryData(categoryData);
    return repository.registerProductCategory(normalizedData);
};

const updateProductCategory = async (id, categoryData) => {
    const normalizedId = normalizeId(id);
    const normalizedData = validateCategoryData(categoryData, true);
    const existingCategory = await repository.getProductCategoryById(normalizedId);

    if (!existingCategory) {
        return null;
    }

    return repository.updateProductCategory(normalizedId, normalizedData);
};

const deactivateProductCategory = async (id) => {
    const normalizedId = normalizeId(id);
    const existingCategory = await repository.getProductCategoryById(normalizedId);

    if (!existingCategory) {
        return null;
    }

    return repository.deactivateProductCategory(normalizedId);
};

module.exports = {
    getAllProductCategories,
    getProductCategoryById,
    registerProductCategory,
    updateProductCategory,
    deactivateProductCategory
};