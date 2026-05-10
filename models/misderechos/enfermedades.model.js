const db = require('../../config/db').promise();

//--------------- ENFERMEDADES Y ACCIDENTES MODEL ------------------//

const getEnfermedades = (id) => {
    return db.query('SELECT * FROM misderechos_enfermedades WHERE id = ?', [id])
}

const updateEnfermedades = (id, { descripcion, titulo_1, texto_1, titulo_2, texto_2, titulo_3, texto_3, titulo_4, texto_4, titulo_5, texto_5, titulo_6, texto_6, titulo_7, texto_7, titulo_8, texto_8, titulo_9, texto_9, titulo_10, texto_10, titulo_11, texto_11, titulo_12, texto_12 }) => {
    return db.query('UPDATE misderechos_enfermedades SET descripcion = ?, titulo_1 = ?, texto_1 = ?, titulo_2 = ?, texto_2 = ?, titulo_3 = ?, texto_3 = ?, titulo_4 = ?, texto_4 = ?, titulo_5 = ?, texto_5 = ?, titulo_6 = ?, texto_6 = ?, titulo_7 = ?, texto_7 = ?, titulo_8 = ?, texto_8 = ?, titulo_9 = ?, texto_9 = ?, titulo_10 = ?, texto_10 = ?, titulo_11 = ?, texto_11 = ?, titulo_12 = ?, texto_12 = ? WHERE id = ?', [descripcion, titulo_1, texto_1, titulo_2, texto_2, titulo_3, texto_3, titulo_4, texto_4, titulo_5, texto_5, titulo_6, texto_6, titulo_7, texto_7, titulo_8, texto_8, titulo_9, texto_9, titulo_10, texto_10, titulo_11, texto_11, titulo_12, texto_12, id])
}

module.exports = {
    getEnfermedades, updateEnfermedades
}