const crypto = require('crypto');
const createError = require('http-errors');
const sharp = require('sharp');

const NEWS_IMAGE_MAX_EDGE = 1920;
const NEWS_JPEG_QUALITY = 82;

function supabaseUrl() {
  return (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
}

function readKey() {
  const anon = (process.env.SUPABASE_ANON_KEY || '').trim();
  if (anon) return anon;
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
}

function writeKey() {
  const k = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!k) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY para crear, actualizar o eliminar noticias.'
    );
  }
  return k;
}

function assertReadConfigured() {
  const url = supabaseUrl();
  const key = readKey();
  if (!url || !key) {
    throw new Error(
      'Faltan SUPABASE_URL y SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return { url, key };
}

function escapeHtml(text) {
  if (text == null || text === '') return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function mapNewsToActualidad(row) {
  const description = row.description || '';
  const contenido = description.includes('<')
    ? description
    : `<p>${escapeHtml(description)}</p>`;

  const fecha =
    row.date != null && row.date !== ''
      ? String(row.date).slice(0, 10)
      : row.created_at
        ? String(row.created_at).slice(0, 10)
        : null;

  return {
    id: row.id,
    titulo: row.title || '',
    imagen: row.imageUrl || '',
    contenido,
    fecha,
    isDelete: 0,
    url: row.url || null,
  };
}
function mapActualidadBodyToNews(body) {
  const title = body.titulo != null ? String(body.titulo) : '';
  const description = body.contenido != null ? String(body.contenido) : '';
  const imageUrl = body.imagen != null ? String(body.imagen) : '';
  const date =
    body.fecha != null && String(body.fecha).trim() !== ''
      ? String(body.fecha).slice(0, 10)
      : null;
  const url =
    body.url != null && String(body.url).trim() !== ''
      ? String(body.url).trim()
      : null;
  return { title, description, date, imageUrl, url };
}

async function fetchNewsList() {
  const { url, key } = assertReadConfigured();
  const qs = 'select=*&order=%22date%22.desc.nullslast,created_at.desc';
  const res = await fetch(`${url}/rest/v1/news?${qs}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase news list: ${res.status} ${text}`);
  }

  return res.json();
}

async function fetchNewsById(id) {
  const { url, key } = assertReadConfigured();
  const enc = encodeURIComponent(id);
  const res = await fetch(`${url}/rest/v1/news?id=eq.${enc}&select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase news by id: ${res.status} ${text}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function insertNewsFromBody(body) {
  const url = supabaseUrl();
  const key = writeKey();
  const payload = mapActualidadBodyToNews(body);
  const res = await fetch(`${url}/rest/v1/news`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase news insert: ${res.status} ${text}`);
  }

  return { affectedRows: 1 };
}

async function patchNewsFromBody(id, body) {
  const url = supabaseUrl();
  const key = writeKey();
  const enc = encodeURIComponent(id);
  const payload = mapActualidadBodyToNews(body);
  const res = await fetch(`${url}/rest/v1/news?id=eq.${enc}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase news update: ${res.status} ${text}`);
  }

  return { affectedRows: 1 };
}

function newsBucket() {
  return (process.env.SUPABASE_NEWS_BUCKET || 'aliadas-news').trim();
}
async function compressNewsImageBuffer(buffer) {
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.format) {
      throw createError(400, 'No se pudo leer el formato de la imagen.');
    }
    const resized = sharp(buffer).rotate().resize({
      width: NEWS_IMAGE_MAX_EDGE,
      height: NEWS_IMAGE_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    });
    const usePng = meta.format === 'png' && meta.hasAlpha === true;
    let outBuf;
    let contentType;
    let ext;
    if (usePng) {
      outBuf = await resized.png({ compressionLevel: 9 }).toBuffer();
      contentType = 'image/png';
      ext = '.png';
    } else {
      outBuf = await resized
        .jpeg({ quality: NEWS_JPEG_QUALITY, mozjpeg: true })
        .toBuffer();
      contentType = 'image/jpeg';
      ext = '.jpg';
    }
    return { buffer: outBuf, contentType, ext };
  } catch (err) {
    if (err.status === 400 && err.expose) {
      throw err;
    }
    throw createError(
      400,
      'No se pudo procesar la imagen. Usa JPG, PNG o WebP válidos.'
    );
  }
}
async function uploadNewsImageBuffer(buffer, _originalname, _mimetype) {
  const processed = await compressNewsImageBuffer(buffer);
  const url = supabaseUrl();
  const key = writeKey();
  const bucket = newsBucket();
  const ext = processed.ext;
  const objectPath = `news/${crypto.randomUUID()}${ext}`;
  const enc = objectPath.split('/').map(encodeURIComponent).join('/');
  const uploadEndpoint = `${url}/storage/v1/object/${bucket}/${enc}`;

  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': processed.contentType,
      'x-upsert': 'true',
    },
    body: processed.buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al subir imagen: ${res.status} ${text}`);
  }

  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
}
function storageObjectPathFromPublicImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const clean = imageUrl.split('?')[0].split('#')[0];
  const bucket = newsBucket();
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = clean.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(clean.slice(idx + marker.length));
  } catch {
    return null;
  }
}

async function deleteStorageObjectByPath(objectPath) {
  if (!objectPath) return;
  const base = supabaseUrl();
  const key = writeKey();
  const bucket = newsBucket();
  const enc = objectPath.split('/').map(encodeURIComponent).join('/');
  const endpoint = `${base}/storage/v1/object/${bucket}/${enc}`;
  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Error al borrar imagen en Storage: ${res.status} ${text}`);
  }
}

async function deleteNewsById(id) {
  const url = supabaseUrl();
  const key = writeKey();
  const enc = encodeURIComponent(id);

  const row = await fetchNewsById(id);
  if (!row) {
    return { affectedRows: 0 };
  }

  const objectPath = storageObjectPathFromPublicImageUrl(row.imageUrl);
  if (objectPath) {
    await deleteStorageObjectByPath(objectPath);
  }

  const res = await fetch(`${url}/rest/v1/news?id=eq.${enc}`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase news delete: ${res.status} ${text}`);
  }

  return { affectedRows: 1 };
}

module.exports = {
  mapNewsToActualidad,
  mapActualidadBodyToNews,
  fetchNewsList,
  fetchNewsById,
  insertNewsFromBody,
  patchNewsFromBody,
  deleteNewsById,
  uploadNewsImageBuffer,
  storageObjectPathFromPublicImageUrl,
  deleteStorageObjectByPath,
};
