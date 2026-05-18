const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');
function expiryUnixFromExpiresIn(expiresIn) {
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
    return nowSec + expiresIn;
  }
  const s = String(expiresIn).trim();
  if (/^\d+$/.test(s)) {
    return nowSec + Number.parseInt(s, 10);
  }
  const m = /^(\d+)\s*([smhdw])$/i.exec(s);
  if (!m) {
    throw new Error(`JWT_EXPIRES_IN inválido: ${expiresIn}`);
  }
  const value = Number.parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const mult = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  if (!mult[unit]) {
    throw new Error(`JWT_EXPIRES_IN unidad no soportada: ${expiresIn}`);
  }
  return nowSec + value * mult[unit];
}

function createToken(user) {
  const exp_date = expiryUnixFromExpiresIn(jwtExpiresIn);
  const payload = {
    userId: user.id,
    name: user.name,
    loginUsername: user.username,
    exp_date,
  };
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}
function cookieMaxAgeMsFromExpiresIn(expiresIn) {
  const expUnix = expiryUnixFromExpiresIn(expiresIn);
  const nowSec = Math.floor(Date.now() / 1000);
  return Math.max(0, (expUnix - nowSec) * 1000);
}

module.exports = {
  createToken,
  cookieMaxAgeMsFromExpiresIn,
};
