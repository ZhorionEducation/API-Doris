const repository = require('../repositories/roleRepository');

const validationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const normalizeCode = (codigo) => {
    if (typeof codigo !== 'string') {
        throw validationError('El código del rol es obligatorio');
    }

    const normalizedCode = codigo.trim();

    if (!normalizedCode || normalizedCode.length > 20) {
        throw validationError('El código es obligatorio y debe tener máximo 20 caracteres');
    }

    return normalizedCode;
};

const validateRoleData = (roleData, isUpdate = false) => {
    if (!roleData || typeof roleData !== 'object' || Array.isArray(roleData)) {
        throw validationError('El cuerpo de la solicitud debe ser un objeto');
    }

    const codigo = isUpdate ? undefined : normalizeCode(roleData.codigo);
    const nombre = typeof roleData.nombre === 'string'
        ? roleData.nombre.trim()
        : '';

    if (!nombre || nombre.length > 60) {
        throw validationError('El nombre es obligatorio y debe tener máximo 60 caracteres');
    }

    const descripcion = roleData.descripcion ?? null;

    if (
        descripcion !== null &&
        (typeof descripcion !== 'string' || descripcion.length > 255)
    ) {
        throw validationError('La descripción debe tener máximo 255 caracteres');
    }

    const estado = roleData.estado === undefined && !isUpdate
        ? 'Activo'
        : roleData.estado;

    if (!['Activo', 'Inactivo'].includes(estado)) {
        throw validationError('El estado debe ser Activo o Inactivo');
    }

    return isUpdate
        ? { nombre, descripcion, estado }
        : { codigo, nombre, descripcion, estado };
};

const getAllRoles = async (page, limit) => {
    return repository.getAllRoles(page, limit);
};

const getRoleByCode = async (codigo) => {
    return repository.getRoleByCode(normalizeCode(codigo));
};

const registerRole = async (roleData) => {
    return repository.registerRole(validateRoleData(roleData));
};

const updateRole = async (codigo, roleData) => {
    const normalizedCode = normalizeCode(codigo);
    const normalizedData = validateRoleData(roleData, true);
    const existingRole = await repository.getRoleByCode(normalizedCode);

    if (!existingRole) {
        return null;
    }

    return repository.updateRole(normalizedCode, normalizedData);
};

const deactivateRole = async (codigo) => {
    const normalizedCode = normalizeCode(codigo);
    const existingRole = await repository.getRoleByCode(normalizedCode);

    if (!existingRole) {
        return null;
    }

    return repository.deactivateRole(normalizedCode);
};

module.exports = {
    getAllRoles,
    getRoleByCode,
    registerRole,
    updateRole,
    deactivateRole
};