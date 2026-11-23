const db = require('../config/db');

// Función para obtener todos los usuarios
// se le debe pasar los parametros de paginacion page y limit, para poder hacer la consulta a la base de datos y devolver los resultados paginados
const getAllUsers = async (page, limit) => {
    // este offset se utiliza para calcular el punto de inicio de la consulta a la base de datos, dependiendo de la pagina y el limite de resultados por pagina
    const offset = (page - 1) * limit;

    // se hace la consulta a la base de datos para obtener el total de usuarios y los usuarios paginados
    const [countRows] = await db.query(
        'SELECT COUNT(*) AS total FROM tb_usuarios'
    );

    const [rows] = await db.query(
        `
        SELECT
            numero_documento,
            rol_codigo,
            tipo_documento,
            nombres,
            apellidos,
            email,
            telefono,
            direccion,
            alergias,
            fecha_ingreso,
            estado
        FROM tb_usuarios
        ORDER BY numero_documento ASC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
    );

    const total = Number(countRows[0].total);

    return {
        data: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Función para registrar un nuevo usuario, recibe un objeto con los datos del usuario a registrar
const registerUser = async (userData) => {
    const {
        numero_documento,
        rol_codigo,
        tipo_documento,
        nombres,
        apellidos,
        email,
        contrasena,
        telefono,
        direccion,
        alergias,
        fecha_ingreso,
        estado
    } = userData;

    const [rows] = await db.query(
        `
        INSERT INTO tb_usuarios (
            numero_documento,
            rol_codigo,
            tipo_documento,
            nombres,
            apellidos,
            email,
            contrasena,
            telefono,
            direccion,
            alergias,
            fecha_ingreso,
            estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            numero_documento,
            rol_codigo,
            tipo_documento,
            nombres,
            apellidos,
            email,
            contrasena,
            telefono,
            direccion,
            alergias,
            fecha_ingreso,
            estado
        ]
    );

    return rows;
};

// Función para actualizar un usuario existente, recibe el id del usuario y un objeto con los datos a actualizar
const updateUser = async (userId, userData) => {
    const {
        rol_codigo,
        tipo_documento,
        nombres,
        apellidos,
        email,
        telefono,
        direccion,
        alergias,
        fecha_ingreso,
        estado
    } = userData;
    const [rows] = await db.query(
        `
        UPDATE tb_usuarios
        SET
            rol_codigo = ?,
            tipo_documento = ?,
            nombres = ?,
            apellidos = ?,
            email = ?,
            telefono = ?,
            direccion = ?,
            alergias = ?,
            fecha_ingreso = ?,
            estado = ?
        WHERE numero_documento = ?
        `,
        [
            rol_codigo,
            tipo_documento,
            nombres,
            apellidos,
            email,
            telefono,
            direccion,
            alergias,
            fecha_ingreso,
            estado,
            userId
        ]
    );

    return rows;
};

module.exports = {
    getAllUsers,
    registerUser,
    updateUser
};