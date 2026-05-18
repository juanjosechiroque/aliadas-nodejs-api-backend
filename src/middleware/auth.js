const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const supabaseUsers = require('../api/users/users.model');
const { ACCESS_TOKEN_COOKIE } = require('./auth-cookie');
function extractBearerToken(authorizationHeader) {
  if (authorizationHeader == null || typeof authorizationHeader !== 'string') {
    return null;
  }
  const trimmed = authorizationHeader.trim();
  const m = /^Bearer\s+(.+)$/i.exec(trimmed);
  return m ? m[1].trim() : null;
}

function getAccessTokenFromRequest(req) {
  const fromHeader = extractBearerToken(req.headers.authorization);
  if (fromHeader) {
    return fromHeader;
  }
  const fromCookie = req.cookies && req.cookies[ACCESS_TOKEN_COOKIE];
  if (
    fromCookie &&
    typeof fromCookie === 'string' &&
    fromCookie.trim() !== ''
  ) {
    return fromCookie.trim();
  }
  return null;
}

const checkToken = async (req, res, next) => {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({
      error:
        'No tienes permiso para acceder a este contenido (sin sesión o cabecera Bearer)',
    });
  }
  let obj;
  try {
    obj = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({
      error:
        'No tienes permiso para acceder a este contenido (token inválido o caducado)',
    });
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
    console.error('[auth] checkToken usuario', e);
    return res.status(401).json({ error: 'Usuario no válido' });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user && req.user.rol_type === 'admin') {
    next();
  } else {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para ver este contenido' });
  }
};

module.exports = {
  checkToken,
  checkAdmin,
  extractBearerToken,
  getAccessTokenFromRequest,
};
