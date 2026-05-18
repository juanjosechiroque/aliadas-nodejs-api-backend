const model = require('./actualidad.model');
const { sanitizeRichHtml } = require('../../utils/sanitize-rich-html');

function mapRowToSafeActualidad(row) {
  const item = model.mapNewsToActualidad(row);
  item.contenido = sanitizeRichHtml(item.contenido);
  return item;
}

function plainTextFromHtml(s) {
  if (s == null) {
    return '';
  }
  return String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function listNews() {
  const rows = await model.fetchNewsList();
  return rows.map(mapRowToSafeActualidad);
}

async function getNewsMapped(idContent) {
  const row = await model.fetchNewsById(idContent);
  if (!row) {
    return null;
  }
  return mapRowToSafeActualidad(row);
}

async function deleteNews(noticiaId) {
  return model.deleteNewsById(noticiaId);
}

async function createNewsWithImage(file, body) {
  const titulo = String(body.titulo ?? '').trim();
  const contenidoRaw = String(body.contenido ?? '');
  let fecha = body.fecha;
  if (fecha == null || String(fecha).trim() === '') {
    fecha = todayYmd();
  }
  const imageUrl = await model.uploadNewsImageBuffer(
    file.buffer,
    file.originalname,
    file.mimetype
  );
  const payload = {
    titulo,
    fecha,
    contenido: sanitizeRichHtml(contenidoRaw),
    url: body.url,
    imagen: imageUrl,
  };
  return model.insertNewsFromBody(payload);
}

async function patchNews(id, body) {
  const safe = { ...body };
  if (safe.contenido != null) {
    safe.contenido = sanitizeRichHtml(String(safe.contenido));
  }
  return model.patchNewsFromBody(id, safe);
}

module.exports = {
  plainTextFromHtml,
  todayYmd,
  listNews,
  getNewsMapped,
  deleteNews,
  createNewsWithImage,
  patchNews,
};
