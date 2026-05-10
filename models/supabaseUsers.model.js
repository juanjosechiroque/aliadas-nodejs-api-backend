/**
 * Usuarios de la app: public.users (solo service_role desde Node).
 */

const TABLE = 'users';

function supabaseUrl() {
  return (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
}

function serviceKey() {
  const k = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!k) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY para acceder a public.users.'
    );
  }
  return k;
}

function assertConfigured() {
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url) throw new Error('Falta SUPABASE_URL.');
  return { url, key };
}

async function fetchAllActiveUsers() {
  const { url, key } = assertConfigured();
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

async function fetchUserById(id) {
  const { url, key } = assertConfigured();
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
  const data = await res.json();
  const rows = Array.isArray(data) ? data : [data];
  return rows.length ? rows[0] : null;
}

async function fetchUserByUsername(username) {
  const { url, key } = assertConfigured();
  const enc = encodeURIComponent(username);
  const res = await fetch(
    `${url}/rest/v1/${TABLE}?username=eq.${enc}&is_deleted=eq.false&select=*`,
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
    throw new Error(`Supabase ${TABLE} by username: ${res.status} ${text}`);
  }
  const data = await res.json();
  const rows = Array.isArray(data) ? data : [data];
  return rows.length ? rows[0] : null;
}

async function insertUser(row) {
  const { url, key } = assertConfigured();
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
  const data = await res.json();
  const rows = Array.isArray(data) ? data : [data];
  return rows.length ? rows[0] : null;
}

async function patchUser(id, payload) {
  const { url, key } = assertConfigured();
  const enc = encodeURIComponent(id);
  const res = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${enc}`, {
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
  const raw = await res.text();
  if (!raw || !raw.trim()) {
    return { affectedRows: 1 };
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { affectedRows: 1 };
  }
  if (Array.isArray(data) && data.length) return data[0];
  if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  return { affectedRows: 1 };
}

async function softDeleteUser(id) {
  return patchUser(id, { is_deleted: true });
}

module.exports = {
  fetchAllActiveUsers,
  fetchUserById,
  fetchUserByUsername,
  insertUser,
  patchUser,
  softDeleteUser,
};
