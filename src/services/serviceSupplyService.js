const repository = require('../repositories/serviceSupplyRepository');

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

const normalizeServiceCode = (codigo) => {
    if (typeof codigo !== 'string') {
        throw validationError('servicio_codigo es obligatorio');
    }

    const normalizedCode = codigo.trim();

    if (!normalizedCode || normalizedCode.length > 20) {
        throw validationError('servicio_codigo es obligatorio y debe tener máximo 20 caracteres');
    }

    return normalizedCode;
};

const parseInteger = (value, field, max) => {
    if (
        (typeof value !== 'number' && typeof value !== 'string') ||
        (typeof value === 'string' && !value.trim())
    ) {
        throw validationError(`${field} debe ser un entero válido`);
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > max) {
        throw validationError(`${field} debe ser un entero entre 1 y ${max}`);
    }

    return parsedValue;
};

const parseQuantity = (value) => {
    if (
        (typeof value !== 'number' && typeof value !== 'string') ||
        (typeof value === 'string' && !value.trim())
    ) {
        throw validationError('cantidad debe ser mayor a 0 y tener máximo dos decimales');
    }

    const normalizedValue = typeof value === 'string' ? value.trim() : String(value);

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) {
        throw validationError('cantidad debe ser mayor a 0 y tener máximo dos decimales');
    }

    const cantidad = Number(normalizedValue);

    if (cantidad <= 0 || cantidad > 99999999.99) {
        throw validationError('cantidad excede el rango permitido');
    }

    return cantidad;
};

const normalizeObservaciones = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== 'string') {
        throw validationError('observaciones debe ser texto o null');
    }

    return value;
};

const validateSupplyData = (supplyData, isUpdate = false) => {
    if (!supplyData || typeof supplyData !== 'object' || Array.isArray(supplyData)) {
        throw validationError('El cuerpo de la solicitud debe ser un objeto');
    }

    const servicio_codigo = normalizeServiceCode(supplyData.servicio_codigo);
    const producto_id = parseInteger(
        supplyData.producto_id,
        'producto_id',
        2147483647
    );
    const cantidad = parseQuantity(supplyData.cantidad);

    const estado = supplyData.estado === undefined && !isUpdate
        ? 'Activo'
        : supplyData.estado;

    if (!['Activo', 'Inactivo'].includes(estado)) {
        throw validationError('El estado debe ser Activo o Inactivo');
    }

    return {
        servicio_codigo,
        producto_id,
        cantidad,
        observaciones: normalizeObservaciones(supplyData.observaciones),
        estado
    };
};

const getAllServiceSupplies = async (page, limit) => {
    return repository.getAllServiceSupplies(page, limit);
};

const getServiceSupplyById = async (id) => {
    return repository.getServiceSupplyById(normalizeId(id));
};

const registerServiceSupply = async (supplyData) => {
    return repository.registerServiceSupply(validateSupplyData(supplyData));
};

const updateServiceSupply = async (id, supplyData) => {
    const normalizedId = normalizeId(id);
    const normalizedData = validateSupplyData(supplyData, true);
    const existingSupply = await repository.getServiceSupplyById(normalizedId);

    if (!existingSupply) {
        return null;
    }

    return repository.updateServiceSupply(normalizedId, normalizedData);
};

const deactivateServiceSupply = async (id) => {
    const normalizedId = normalizeId(id);
    const existingSupply = await repository.getServiceSupplyById(normalizedId);

    if (!existingSupply) {
        return null;
    }

    return repository.deactivateServiceSupply(normalizedId);
};

module.exports = {
    getAllServiceSupplies,
    getServiceSupplyById,
    registerServiceSupply,
    updateServiceSupply,
    deactivateServiceSupply
};