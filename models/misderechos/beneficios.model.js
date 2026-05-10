const db = require('../../config/db').promise();

//--------------- SEGURIDAD SOCIAL MODEL ------------------//

const getBeneficios = (id) => {
    return db.query('SELECT * FROM misderechos_beneficios WHERE id = ?', [id])
}

const updateBeneficios = (id, { descripcion, titulo_1, texto_1, titulo_2, texto_2, titulo_3, texto_3, titulo_4, texto_4, titulo_5, texto_5, titulo_6, texto_6, titulo_7, texto_7, titulo_8, texto_8, titulo_9, texto_9, titulo_10, texto_10, titulo_11, texto_11, titulo_12, texto_12, titulo_13, texto_13, titulo_14, texto_14, titulo_15, texto_15, titulo_16, texto_16, titulo_17, texto_17, titulo_18, texto_18, titulo_19, texto_19, titulo_20, texto_20 }) => {
    return db.query('UPDATE misderechos_beneficios SET descripcion = ?, titulo_1 = ?, texto_1 = ?, titulo_2 = ?, texto_2 = ?, titulo_3 = ?, texto_3 = ?, titulo_4 = ?, texto_4 = ?, titulo_5 = ?, texto_5 = ?, titulo_6 = ?, texto_6 = ?, titulo_7 = ?, texto_7 = ?, titulo_8 = ?, texto_8 = ?, titulo_9 = ?, texto_9 = ?, titulo_10 = ?, texto_10 = ?, titulo_11 = ?, texto_11 = ?, titulo_12 = ?, texto_12 = ?, titulo_13 = ?, texto_13 = ?, titulo_14 = ?, texto_14 = ?, titulo_15 = ?, texto_15 = ?, titulo_16 = ?, texto_16 = ?, titulo_17 = ?, texto_17 = ?, titulo_18 = ?, texto_18 = ?, titulo_19 = ?, texto_19 = ?, titulo_20 = ?, texto_20 = ? WHERE id = ?', [descripcion, titulo_1, texto_1, titulo_2, texto_2, titulo_3, texto_3, titulo_4, texto_4, titulo_5, texto_5, titulo_6, texto_6, titulo_7, texto_7, titulo_8, texto_8, titulo_9, texto_9, titulo_10, texto_10, titulo_11, texto_11, titulo_12, texto_12, titulo_13, texto_13, titulo_14, texto_14, titulo_15, texto_15, titulo_16, texto_16, titulo_17, texto_17, titulo_18, texto_18, titulo_19, texto_19, titulo_20, texto_20, id])
}

module.exports = {
    getBeneficios, updateBeneficios
}