/** @deprecated Contenido migrado a Supabase (modelo supabase* correspondiente). */const db = require('../../config/db').promise();

//--------------- TRABAJO MODEL ------------------//
const getTrabajo = (id) => {
    return db.query('SELECT * FROM misderechos_trabajodomestico WHERE id = ?', [id])
}

const updateTrabajo = (id, { descripcion, titulo_1, texto_1, titulo_2, texto_2, titulo_3, texto_3, titulo_4, texto_4, titulo_5, texto_5, titulo_6, texto_6, titulo_7, texto_7, titulo_8, texto_8, titulo_9, texto_9, titulo_10, texto_10 }) => {
    return db.query('UPDATE misderechos_trabajodomestico SET descripcion = ?, titulo_1 = ?, texto_1 = ?, titulo_2 = ?, texto_2 = ?, titulo_3 = ?, texto_3 = ?, titulo_4 = ?, texto_4 = ?, titulo_5 = ?, texto_5 = ?, titulo_6 = ?, texto_6 = ?, titulo_7 = ?, texto_7 = ?, titulo_8 = ?, texto_8 = ?, titulo_9 = ?, texto_9 = ?, titulo_10 = ?, texto_10 = ? WHERE id = ?', [descripcion, titulo_1, texto_1, titulo_2, texto_2, titulo_3, texto_3, titulo_4, texto_4, titulo_5, texto_5, titulo_6, texto_6, titulo_7, texto_7, titulo_8, texto_8, titulo_9, texto_9, titulo_10, texto_10, id])
}



module.exports = {
    getTrabajo, updateTrabajo
}
