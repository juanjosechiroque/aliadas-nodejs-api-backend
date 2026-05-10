/** @deprecated Usuarios en MySQL; la API usa `supabaseUsers.model.js` y `public.users`. */
const db = require('../config/db').promise();

//--------------- USUARIOS MODEL ------------------//


//Listar todos los usuarios
const getAllUsers = () => {
    return db.query('SELECT * FROM users WHERE isDelete = 0')
}

//Listar usuario por Id
const getUserById = (idUser) => {
    return db.query('SELECT * FROM users WHERE id = ?', [idUser])
}

//Agregar Usuario
const createUser = ({ name, lastname, email, city, roll, fecha_nacimiento, mobil, password, isDelete }) => {
    return db.query('INSERT INTO users(name, lastname, email, city, roll, fecha_nacimiento, mobil, password, isDelete) VALUES (?,?,?,?,?,?,?,?,?)', [name, lastname, email, city, roll, fecha_nacimiento, mobil, password, 0])
}

//Obtener un usuari por email
const getUserByEmail = (userEmail) => {
    return db.query('SELECT * FROM users WHERE email = ?', [userEmail])
}

//Actualizar un Usuario
const updateUser = (userId, { name, lastname, email, city, roll, fecha_nacimiento, mobil, password, isDelete }) => {
    return db.query('UPDATE users SET name = ?, lastname = ?, email = ?, city = ?, roll = ?, fecha_nacimiento = ?, mobil = ?, password = ?, isDelete = ? WHERE id = ?', [name, lastname, email, city, roll, fecha_nacimiento, mobil, password, 0, userId])
}

//Eliminar un usuario
const deleteUserById = (userId) => {
    return db.query('UPDATE users SET isDelete = 1 WHERE id = ?', [userId])
}

module.exports = {
    getAllUsers, getUserById, createUser, updateUser, deleteUserById, getUserByEmail
}