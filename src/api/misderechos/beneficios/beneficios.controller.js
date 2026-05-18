const service = require('./beneficios.service');
const { sendServerError } = require('../../../utils/api-errors');

async function getById(req, res) {
  const { idContent } = req.params;
  try {
    const row = await service.getById(idContent);
    if (!row) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    res.json(row);
  } catch (error) {
    sendServerError(res, error, 'beneficios');
  }
}

async function patch(req, res) {
  const { id } = req.params;
  try {
    const out = await service.patchContent(id, req.body);
    res.json(out);
  } catch (error) {
    sendServerError(res, error, 'beneficios');
  }
}

module.exports = {
  getById,
  patch,
};
