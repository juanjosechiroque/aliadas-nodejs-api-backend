const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const supabaseUsers = require('../api/users/users.model');
const { ACCESS_TOKEN_COOKIE } = require('./auth-cookie');

const PANEL_ADMIN_ROLES = new Set(['admin', 'cms_admin']);
const SECURITY_ADMIN_ROLE = 'admin';

function isPanelAdmin(user) {
  return Boolean(user && PANEL_ADMIN_ROLES.has(user.rol_type));
}

function isSecurityAdmin(user) {
  return Boolean(user && user.rol_type === SECURITY_ADMIN_ROLE);
}

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
    if (!usuario || usuario.is_deleted || usuario.is_active === false) {
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

const checkPanelAdmin = (req, res, next) => {
  if (isPanelAdmin(req.user)) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para ver este contenido' });
  }
};

const checkSecurityAdmin = (req, res, next) => {
  if (isSecurityAdmin(req.user)) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para gestionar usuarios' });
  }
};

/** @deprecated Use checkPanelAdmin */
const checkAdmin = checkPanelAdmin;

module.exports = {
  checkToken,
  checkPanelAdmin,
  checkSecurityAdmin,
  checkAdmin,
  isPanelAdmin,
  isSecurityAdmin,
  extractBearerToken,
  getAccessTokenFromRequest,
};
