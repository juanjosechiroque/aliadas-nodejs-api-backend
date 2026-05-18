const sanitizeHtml = require('sanitize-html');
const OPTIONS = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'figure',
    'figcaption',
    'span',
    'div',
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'class'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
};

function sanitizeRichHtml(input) {
  if (input == null) {
    return '';
  }
  return sanitizeHtml(String(input), OPTIONS);
}

module.exports = { sanitizeRichHtml };
