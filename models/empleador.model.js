const db = require('../config/db').promise();

//------------- EMPLEADORES ----------

//Listar contenido Empleadores

const getEmpleadores = (id) => {
    return db.query('SELECT * FROM empleador WHERE id = ?', [id])
}

const updateEmpleador = (id, { generalidades, pregunta1, respuesta1, pregunta2, respuesta2, pregunta3, respuesta3, pregunta4, respuesta4, pregunta5, respuesta5, pregunta6, respuesta6, pregunta7, respuesta7, pregunta8, respuesta8, pregunta9, respuesta9, pregunta10, respuesta10 }) => {
    return db.query('UPDATE empleador SET generalidades = ?, pregunta1 = ?, respuesta1 = ?, pregunta2 = ?, respuesta2 = ?, pregunta3 = ?, respuesta3 = ?, pregunta4 = ?, respuesta4 = ?, pregunta5 = ?, respuesta5 = ?, pregunta6 = ?, respuesta6 = ?, pregunta7 = ?, respuesta7 = ?, pregunta8 = ?, respuesta8 = ?, pregunta9 = ?, respuesta9 = ?, pregunta10 = ?, respuesta10 = ? WHERE id = ?', [generalidades, pregunta1, respuesta1, pregunta2, respuesta2, pregunta3, respuesta3, pregunta4, respuesta4, pregunta5, respuesta5, pregunta6, respuesta6, pregunta7, respuesta7, pregunta8, respuesta8, pregunta9, respuesta9, pregunta10, respuesta10, id])
}


module.exports = {
    getEmpleadores, updateEmpleador
}