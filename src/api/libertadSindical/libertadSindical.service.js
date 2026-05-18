const model = require('./libertadSindical.model');
const {
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
} = require('../../utils/cms-rich-fields');

async function getById(id) {
  const row = await model.fetchLibertadById(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.patchLibertadFromBody(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
