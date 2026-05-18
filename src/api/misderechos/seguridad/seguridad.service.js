const model = require('./seguridad.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchSeguridadSocialById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchSeguridadSocialFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
