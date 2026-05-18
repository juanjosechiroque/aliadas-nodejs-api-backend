const { sanitizeRichHtml } = require('./sanitize-rich-html');

const PAIR_COUNT = 10;
function cmsRichFieldKeys() {
  const keys = ['description'];
  for (let i = 1; i <= PAIR_COUNT; i++) {
    keys.push(`title_${i}`, `text_${i}`);
  }
  return keys;
}

const RICH_KEYS = new Set(cmsRichFieldKeys());

function sanitizeCmsRow(row) {
  if (!row || typeof row !== 'object') {
    return row;
  }
  const out = { ...row };
  for (const k of RICH_KEYS) {
    if (
      Object.prototype.hasOwnProperty.call(out, k) &&
      out[k] != null &&
      typeof out[k] === 'string'
    ) {
      out[k] = sanitizeRichHtml(out[k]);
    }
  }
  return out;
}
function sanitizeCmsPatchBody(body) {
  const b = body && typeof body === 'object' ? body : {};
  const out = { ...b };
  for (const k of RICH_KEYS) {
    if (Object.prototype.hasOwnProperty.call(out, k) && out[k] != null) {
      out[k] = sanitizeRichHtml(String(out[k]));
    }
  }
  return out;
}

module.exports = {
  cmsRichFieldKeys,
  sanitizeCmsRow,
  sanitizeCmsPatchBody,
};
