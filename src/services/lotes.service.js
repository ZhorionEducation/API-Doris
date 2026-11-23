
const repository = require('../repositories/lotes.repository');

// Crear errores con código HTTP
const crearError = (mensaje, status = 400) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

// Validar identificadores
const validarId = (id) => {
    const numero = Number(id);

    if (
        id === null ||
        id === undefined ||
        id === '' ||
        !Number.isSafeInteger(numero) ||
        numero <= 0
    ) {
        throw crearError('El ID debe ser un entero positivo');
    }

    return numero;
};

// Validar los campos del formulario
const validarDatosLote = (datos) => {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw crearError('Debes enviar los datos del lote');
    }

    const {
        detalle_compra_id,
        numero_lote,
        fecha_vencimiento,
        cantidad_disponible
    } = datos;

    const detalleId = validarId(detalle_compra_id);

    if (
        typeof numero_lote !== 'string' ||
        !numero_lote.trim() ||
        numero_lote.trim().length > 40
    ) {
        throw crearError(
            'El número de lote debe tener entre 1 y 40 caracteres'
        );
    }

    if (
        typeof fecha_vencimiento !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha_vencimiento)
    ) {
        throw crearError(
            'La fecha de vencimiento debe tener formato YYYY-MM-DD'
        );
    }

    const fecha = new Date(`${fecha_vencimiento}T00:00:00Z`);

    if (
        Number.isNaN(fecha.getTime()) ||
        fecha.toISOString().slice(0, 10) !== fecha_vencimiento
    ) {
        throw crearError('La fecha de vencimiento no es válida');
    }

    if (
        cantidad_disponible === null ||
        cantidad_disponible === undefined ||
        cantidad_disponible === ''
    ) {
        throw crearError('La cantidad disponible es obligatoria');
    }

    const cantidad = Number(cantidad_disponible);

    if (!Number.isSafeInteger(cantidad) || cantidad < 0) {
        throw crearError(
            'La cantidad disponible debe ser un entero mayor o igual a cero'
        );
    }

    return {
        detalle_compra_id: detalleId,
        numero_lote: numero_lote.trim(),
        fecha_vencimiento,
        cantidad_disponible: cantidad
    };
};

// Verificar las reglas de negocio
const validarDetalleCompra = async (datos, loteActualId = null) => {
    const detalle = await repository.getDetalleCompraById(
        datos.detalle_compra_id
    );

    if (!detalle) {
        throw crearError('El detalle de compra no existe', 404);
    }

    if (detalle.estado_compra !== 'Recibida') {
        throw crearError(
            'Solo se pueden registrar lotes de compras recibidas'
        );
    }

    if (
        detalle.lote_id !== null &&
        Number(detalle.lote_id) !== Number(loteActualId)
    ) {
        throw crearError(
            'Este detalle de compra ya tiene un lote registrado',
            409
        );
    }

    if (datos.cantidad_disponible > Number(detalle.cantidad)) {
        throw crearError(
            'La cantidad disponible no puede superar la cantidad comprada'
        );
    }
};

// Listar lotes
const getAllLotes = async () => {
    return await repository.getAllLotes();
};

// Consultar un lote
const getLoteById = async (id) => {
    return await repository.getLoteById(validarId(id));
};

// Registrar un lote
const registerLote = async (datos) => {
    const datosValidados = validarDatosLote(datos);

    await validarDetalleCompra(datosValidados);

    const id = await repository.registerLote(datosValidados);

    return await repository.getLoteById(id);
};

// Actualizar un lote
const updateLote = async (id, datos) => {
    const loteId = validarId(id);

    const loteExistente = await repository.getLoteById(loteId);

    if (!loteExistente) {
        return null;
    }

    const datosValidados = validarDatosLote(datos);

    await validarDetalleCompra(datosValidados, loteId);

    await repository.updateLote(loteId, datosValidados);

    return await repository.getLoteById(loteId);
};

// Eliminar un lote
const deleteLote = async (id) => {
    return await repository.deleteLote(validarId(id));
};

// Consultar detalles disponibles
const getDetallesDisponibles = async () => {
    return await repository.getDetallesDisponibles();
};

module.exports = {
    getAllLotes,
    getLoteById,
    registerLote,
    updateLote,
    deleteLote,
    getDetallesDisponibles
};
