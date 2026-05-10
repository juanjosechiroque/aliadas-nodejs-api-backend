const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const supabaseUsers = require('../models/supabaseUsers.model');

const checkToken = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res
      .status(401)
      .json({ error: 'No tienes permiso para acceder a este contenido (sin cabecera)' });
  }
  let obj;
  try {
    obj = jwt.verify(token, 'escuela');
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'No tienes permiso para acceder a este contenido (Token inváido)' });
  }

  if (dayjs().unix() > obj.exp_date) {
    return res.json({ error: 'El token está caducado' });
  }

  try {
    const usuario = await supabaseUsers.fetchUserById(obj.userId);
    if (!usuario || usuario.is_deleted) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    const { password: _pw, ...safe } = usuario;
    req.user = safe;
    next();
  } catch (e) {
    return res.status(401).json({ error: e.message || 'Usuario no válido' });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user && req.user.rol_type === 'admin') {
    next();
  } else {
    return res.json({ error: 'No tienes permiso para ver este contenido' });
  }
};

module.exports = {
  checkToken,
  checkAdmin,
};
