const { buildCorsOptions, isProductionEnv } = require('./config');
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const logger = require('morgan');

const webRouter = require('./web/routes');
const apiRouter = require('./api');
const BODY_LIMIT = '1mb';

const app = express();
app.use(helmet());
app.use(cors(buildCorsOptions()));

app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }));

app.use('/', webRouter);
app.use('/api', apiRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, _next) {
  const status = err.status || 500;
  const exposeDetails = !isProductionEnv;

  if (status >= 500) {
    console.error('[Express]', err);
    const body = {
      error: exposeDetails
        ? err.message || 'Error interno'
        : 'Error interno del servidor. Intenta más tarde.',
    };
    if (exposeDetails && err.stack) {
      body.stack = err.stack;
    }
    return res.status(status).json(body);
  }

  const safeClientError =
    exposeDetails || err.expose === true
      ? err.message || 'Error'
      : 'Solicitud no válida.';
  res.status(status).json({ error: safeClientError });
});

module.exports = app;
