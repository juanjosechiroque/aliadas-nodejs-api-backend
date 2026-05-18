const TABLE = 'customers';

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
      'Falta SUPABASE_SERVICE_ROLE_KEY para escribir en customers.'
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

async function fetchActiveCustomers() {
  const { url, key } = assertReadConfigured();
  const res = await fetch(
    `${url}/rest/v1/${TABLE}?is_deleted=eq.false&select=*&order=id.asc`,
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

async function insertCustomer(body) {
  const url = supabaseUrl();
  const key = writeKey();
  const row = {
    ...(body.id != null && body.id !== '' ? { id: Number(body.id) } : {}),
    type: body.type,
    is_deleted: false,
    date: body.date != null ? body.date : new Date().toISOString().slice(0, 10),
  };
  const res = await fetch(`${url}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} insert: ${res.status} ${text}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : { affectedRows: 1 };
}

async function softDeleteCustomer(id) {
  const url = supabaseUrl();
  const key = writeKey();
  const enc = encodeURIComponent(id);
  const res = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${enc}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ is_deleted: true }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${TABLE} soft delete: ${res.status} ${text}`);
  }
  return { affectedRows: 1 };
}

module.exports = {
  fetchActiveCustomers,
  insertCustomer,
  softDeleteCustomer,
};
