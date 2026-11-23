const repository = require('../repositories/serviceRepository');

const validationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const normalizeCode = (codigo) => {
    if (typeof codigo !== 'string') {
        throw validationError('El código del servicio es obligatorio');
    }

    const normalizedCode = codigo.trim();

    if (!normalizedCode || normalizedCode.length > 20) {
        throw validationError('El código es obligatorio y debe tener máximo 20 caracteres');
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

const parseDecimal = (value, field) => {
    if (
        (typeof value !== 'number' && typeof value !== 'string') ||
        (typeof value === 'string' && !value.trim())
    ) {
        throw validationError(`${field} debe ser un número no negativo con máximo dos decimales`);
    }

    const normalizedValue = typeof value === 'string' ? value.trim() : String(value);

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) {
        throw validationError(`${field} debe ser un número no negativo con máximo dos decimales`);
    }

    return Number(normalizedValue);
};

const normalizeOptionalText = (value, field) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== 'string') {
        throw validationError(`${field} debe ser texto o null`);
    }

    return value;
};

const validateServiceData = (serviceData, isUpdate = false) => {
    if (!serviceData || typeof serviceData !== 'object' || Array.isArray(serviceData)) {
        throw validationError('El cuerpo de la solicitud debe ser un objeto');
    }

    const codigo = isUpdate ? undefined : normalizeCode(serviceData.codigo);
    const categoria_id = parseInteger(serviceData.categoria_id, 'categoria_id', 2147483647);

    const nombre = typeof serviceData.nombre === 'string'
        ? serviceData.nombre.trim()
        : '';

    if (!nombre || nombre.length > 120) {
        throw validationError('El nombre es obligatorio y debe tener máximo 120 caracteres');
    }

    const duracion_minutos = parseInteger(
        serviceData.duracion_minutos,
        'duracion_minutos',
        65535
    );

    const precio_base = parseDecimal(serviceData.precio_base, 'precio_base');

    if (precio_base > 9999999999.99) {
        throw validationError('precio_base excede el máximo permitido');
    }

    const descuento = serviceData.descuento === undefined && !isUpdate
        ? 0
        : parseDecimal(serviceData.descuento, 'descuento');

    if (descuento > 100) {
        throw validationError('descuento debe estar entre 0 y 100');
    }

    const estado = serviceData.estado === undefined && !isUpdate
        ? 'Activo'
        : serviceData.estado;

    if (!['Activo', 'Inactivo'].includes(estado)) {
        throw validationError('El estado debe ser Activo o Inactivo');
    }

    const normalizedData = {
        categoria_id,
        nombre,
        duracion_minutos,
        precio_base,
        descuento,
        descripcion: normalizeOptionalText(serviceData.descripcion, 'descripcion'),
        observaciones: normalizeOptionalText(serviceData.observaciones, 'observaciones'),
        estado
    };

    return isUpdate
        ? normalizedData
        : { codigo, ...normalizedData };
};

const getAllServices = async (page, limit) => {
    return repository.getAllServices(page, limit);
};

const getServiceByCode = async (codigo) => {
    return repository.getServiceByCode(normalizeCode(codigo));
};

const registerService = async (serviceData) => {
    return repository.registerService(validateServiceData(serviceData));
};

const updateService = async (codigo, serviceData) => {
    const normalizedCode = normalizeCode(codigo);
    const normalizedData = validateServiceData(serviceData, true);
    const existingService = await repository.getServiceByCode(normalizedCode);

    if (!existingService) {
        return null;
    }

    return repository.updateService(normalizedCode, normalizedData);
};

const deactivateService = async (codigo) => {
    const normalizedCode = normalizeCode(codigo);
    const existingService = await repository.getServiceByCode(normalizedCode);

    if (!existingService) {
        return null;
    }

    return repository.deactivateService(normalizedCode);
};

module.exports = {
    getAllServices,
    getServiceByCode,
    registerService,
    updateService,
    deactivateService
};