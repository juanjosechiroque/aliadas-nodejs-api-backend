const model = require('./licencias.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchLicenciasById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchLicenciasFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
