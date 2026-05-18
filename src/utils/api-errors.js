const { isProductionEnv } = require('../config');
function sendServerError(res, err, logLabel = '') {
  const prefix = logLabel ? `[API 500] ${logLabel}` : '[API 500]';
  console.error(prefix, err);

  const exposeDetails = !isProductionEnv;
  const raw =
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof err.message === 'string'
      ? err.message.trim()
      : '';
  const message =
    exposeDetails && raw !== ''
      ? raw
      : 'Error interno del servidor. Intenta más tarde.';

  res.status(500).json({ error: message });
}

module.exports = { sendServerError };
