const calculadoraService = require('./calculadora.service');
const { sendServerError } = require('../../utils/api-errors');

function sendServiceError(res, error, context) {
  if (error && error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return sendServerError(res, error, context);
}

async function list(_req, res) {
  try {
    const rows = await calculadoraService.listActive();
    res.json(rows);
  } catch (error) {
    sendServerError(res, error, 'calculadora.list');
  }
}

async function getByAnio(req, res) {
  try {
    const row = await calculadoraService.getByYear(req.params.anio);
    res.json(row);
  } catch (error) {
    sendServiceError(res, error, 'calculadora.getByAnio');
  }
}

async function create(req, res) {
  try {
    const row = await calculadoraService.create(req.body);
    res.json(row);
  } catch (error) {
    sendServiceError(res, error, 'calculadora.create');
  }
}

async function update(req, res) {
  try {
    const row = await calculadoraService.update(req.params.anio, req.body);
    res.json(row);
  } catch (error) {
    sendServiceError(res, error, 'calculadora.update');
  }
}

async function remove(req, res) {
  try {
    await calculadoraService.remove(req.params.anio);
    res.json({ affectedRows: 1 });
  } catch (error) {
    sendServiceError(res, error, 'calculadora.remove');
  }
}

module.exports = {
  list,
  getByAnio,
  create,
  update,
  remove,
};
