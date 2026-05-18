const TABLE = 'cms_trabajo_domestico';
const PAIR_COUNT = 10;

const PATCH_KEYS = ['description'];
for (let i = 1; i <= PAIR_COUNT; i++) {
  PATCH_KEYS.push(`title_${i}`, `text_${i}`);
}

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
      'Falta SUPABASE_SERVICE_ROLE_KEY para actualizar cms_trabajo_domestico.'
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

function buildPatchPayload(body) {
  const b = body && typeof body === 'object' ? body : {};
  const out = {};
  for (const k of PATCH_KEYS) {
    if (Object.prototype.hasOwnProperty.call(b, k)) {
      out[k] = b[k];
    }
  }
  return out;
}

async function fetchTrabajoDomesticoById(id) {
  const { url, key } = assertReadConfigured();
  const enc = encodeURIComponent(id);
  const res = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${enc}&select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} by id: ${res.status} ${text}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function patchTrabajoDomesticoFromBody(id, body) {
  const url = supabaseUrl();
  const key = writeKey();
  const enc = encodeURIComponent(id);
  const payload = buildPatchPayload(body);
  const res = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${enc}`, {
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
    throw new Error(`Supabase ${TABLE} update: ${res.status} ${text}`);
  }

  return { affectedRows: 1 };
}

module.exports = {
  fetchTrabajoDomesticoById,
  patchTrabajoDomesticoFromBody,
};
