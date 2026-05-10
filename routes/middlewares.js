const jwt = require('jsonwebtoken');
const UserModel = require('../models/users.model');
const dayjs = require('dayjs')


const checkToken = async (req, res, next) => {

    //Comprobamos la existencia de Token

    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No tienes permiso para acceder a este contenido (sin cabecera)' })
    }
    //Validamos token
    let obj
    try {
        obj = jwt.verify(token, 'escuela');
    } catch (error) {
        res.status(401).json({ error: 'No tienes permiso para acceder a este contenido (Token inváido)' })
    }

    if (dayjs().unix() > obj.exp_date) {
        return res.json({ error: 'El token está caducado' })
    }
    //Recuperamos información de usuario
    const [usuario] = await UserModel.getUserById(obj.userId);
    req.user = usuario[0];
    next()
}

const checkAdmin = (req, res, next) => {
    if (req.user.roll === "admin") {
        next()
    } else {
        return res.json({ error: "No tienes permiso para ver este contenido" })
    }
}

module.exports = {
    checkToken, checkAdmin
}