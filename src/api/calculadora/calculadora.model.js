const TABLE = 'calculator_parameters';

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
      'Falta SUPABASE_SERVICE_ROLE_KEY para escribir en calculator_parameters.'
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

async function fetchAllActive() {
  const { url, key } = assertReadConfigured();
  const res = await fetch(
    `${url}/rest/v1/${TABLE}?is_deleted=eq.false&select=*&order=year.desc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} list: ${res.status} ${text}`);
  }
  return res.json();
}

async function fetchByYear(year) {
  const { url, key } = assertReadConfigured();
  const enc = encodeURIComponent(year);
  const res = await fetch(
    `${url}/rest/v1/${TABLE}?year=eq.${enc}&is_deleted=eq.false&select=*`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} by year: ${res.status} ${text}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function upsertRow(row) {
  const url = supabaseUrl();
  const key = writeKey();
  const res = await fetch(`${url}/rest/v1/${TABLE}?on_conflict=year`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} upsert: ${res.status} ${text}`);
  }
  const data = await res.json();
  const out = Array.isArray(data) ? data[0] : data;
  return out;
}

async function patchByYear(year, payload) {
  const url = supabaseUrl();
  const key = writeKey();
  const enc = encodeURIComponent(year);
  const res = await fetch(`${url}/rest/v1/${TABLE}?year=eq.${enc}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} patch: ${res.status} ${text}`);
  }
  const data = await res.json();
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function softDeleteByYear(year) {
  return patchByYear(year, { is_deleted: true });
}

module.exports = {
  fetchAllActive,
  fetchByYear,
  upsertRow,
  patchByYear,
  softDeleteByYear,
};
