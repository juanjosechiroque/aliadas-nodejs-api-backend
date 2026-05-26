require('dotenv').config({ quiet: true });

const { buildCorsOptions } = require('./cors');
const raw = Number.parseInt(process.env.PORT || '3000', 10);
const port = Number.isFinite(raw) && raw > 0 ? raw : 3000;

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

if (!jwtSecret || String(jwtSecret).trim() === '') {
  console.error('FATAL: JWT_SECRET es obligatorio y no puede estar vacío.');
  process.exit(1);
}
if (!jwtExpiresIn || String(jwtExpiresIn).trim() === '') {
  console.error('FATAL: JWT_EXPIRES_IN es obligatorio y no puede estar vacío.');
  process.exit(1);
}
const isProductionEnv =
  process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

module.exports = {
  port,
  buildCorsOptions,
  jwtSecret: String(jwtSecret).trim(),
  jwtExpiresIn: String(jwtExpiresIn).trim(),
  isProductionEnv,
};
