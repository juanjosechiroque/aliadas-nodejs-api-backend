const model = require('./beneficios.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchBeneficiosById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchBeneficiosFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
