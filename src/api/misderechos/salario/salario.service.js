const model = require('./salario.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchSalarioById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchSalarioFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
