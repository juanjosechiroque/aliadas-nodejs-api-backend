/** @deprecated La API `/api/actualidad` usa `supabaseNews.model.js` (Supabase `public.news`). Este modelo queda solo por compatibilidad con seeds o scripts que toquen MySQL. */
const db = require('../config/db').promise();

//--------------- ACTUALIDAD MODEL ------------------//

//Listar todas los contenidos
const getAllActualidad = () => {
    return db.query('SELECT * FROM actualidad WHERE isDelete = 0 ORDER BY id DESC')
}

//Listar un curso por ID
const getActualidadById = (id) => {
    return db.query('SELECT * FROM actualidad WHERE id = ?', [id])
}

//Crear una nueva noticia
const createContenido = ({ titulo, imagen, contenido, isDelete, fecha }) => {
    return db.query('INSERT INTO actualidad(titulo, imagen, contenido, isDelete, fecha) VALUES (?, ?, ?, ?, ?)', [titulo, imagen, contenido, 0, fecha])
}

//Eliminar una noticia
const deleteNoticia = (noticiaId) => {
    return db.query('UPDATE actualidad SET isDelete = 1 WHERE id = ?', [noticiaId])
}

//Actualizar una noticia
const updateContenido = (id, { titulo, imagen, contenido, isDelete, fecha }) => {
    return db.query('UPDATE actualidad SET titulo = ?, imagen = ?, contenido = ?, isDelete = ?, fecha = ? WHERE id = ?', [titulo, imagen, contenido, 0, fecha, id])
}


module.exports = {
    getAllActualidad, getActualidadById, createContenido, updateContenido, deleteNoticia
}