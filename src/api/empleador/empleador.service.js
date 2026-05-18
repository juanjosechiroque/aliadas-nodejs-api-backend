const model = require('./empleador.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchEmpleadorById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchEmpleadorFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
