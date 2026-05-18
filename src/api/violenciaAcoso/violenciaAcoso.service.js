const model = require('./violenciaAcoso.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchViolenciaById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchViolenciaFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
