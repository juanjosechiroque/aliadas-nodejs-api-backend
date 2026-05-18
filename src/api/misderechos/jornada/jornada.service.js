const model = require('./jornada.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchJornadaById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchJornadaFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
