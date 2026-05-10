/**
 * CRUD de public.news vía PostgREST (Supabase).
 * Lectura: SUPABASE_ANON_KEY si existe; si no, SUPABASE_SERVICE_ROLE_KEY.
 * Escritura (POST/PATCH/DELETE): requiere SUPABASE_SERVICE_ROLE_KEY (bypass RLS).
 */

const crypto = require('crypto');
const path = require('path');

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

/** Formato que consume el frontend (Actualidad). */
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

/** Mapea cuerpo del dashboard (titulo, imagen, fecha, contenido, url?) → columnas news. */
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
  // "date" es palabra reservada en PostgREST: entre comillas para ordenar bien.
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

function extFromMime(mime) {
  if (!mime) return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return '.jpg';
  return '.jpg';
}

/** Sube un buffer al bucket de noticias y devuelve la URL pública. */
async function uploadNewsImageBuffer(buffer, originalname, mimetype) {
  const url = supabaseUrl();
  const key = writeKey();
  const bucket = newsBucket();
  let ext = path.extname(originalname || '').toLowerCase();
  if (!ext || ext.length > 6) ext = extFromMime(mimetype);
  const objectPath = `news/${crypto.randomUUID()}${ext}`;
  const enc = objectPath.split('/').map(encodeURIComponent).join('/');
  const uploadEndpoint = `${url}/storage/v1/object/${bucket}/${enc}`;

  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': mimetype || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al subir imagen: ${res.status} ${text}`);
  }

  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
}

/** Si la URL es pública de nuestro bucket, devuelve la ruta del objeto (p. ej. `news/uuid.jpg`). */
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
};
