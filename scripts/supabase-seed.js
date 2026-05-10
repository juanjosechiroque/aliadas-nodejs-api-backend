/**
 * Seed Supabase: todas las tablas CMS + usuario desde scripts/seed/*.json.
 *
 *   node scripts/supabase-seed.js
 *
 * Usuario: password_plain en users_seed.json → bcrypt en Supabase (campo password).
 *
 * Noticias: node scripts/supabase-news-import.js (scripts/README.md)
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const LOCAL_SUPABASE_URL = '';
const LOCAL_SERVICE_ROLE_KEY = '';

const backendRoot = path.join(__dirname, '..');
const scriptsDir = __dirname;
const seedDir = path.join(scriptsDir, 'seed');
const frontEnvPath = path.join(backendRoot, '..', 'aliadas-front', '.env');

const CMS_JOBS = [
  ['cms_libertad_sindical', 'seed/cms_libertad_sindical_seed.json'],
  ['cms_violencia_acoso', 'seed/cms_violencia_acoso_seed.json'],
  ['cms_beneficios', 'seed/cms_beneficios_seed.json'],
  ['cms_contratacion', 'seed/cms_contratacion_seed.json'],
  ['cms_trabajo_domestico', 'seed/cms_trabajo_domestico_seed.json'],
  ['cms_jornada', 'seed/cms_jornada_seed.json'],
  ['cms_salario', 'seed/cms_salario_seed.json'],
  ['cms_seguridad_social', 'seed/cms_seguridad_social_seed.json'],
  ['cms_enfermedades', 'seed/cms_enfermedades_seed.json'],
  ['cms_licencias', 'seed/cms_licencias_seed.json'],
  ['cms_empleador', 'seed/cms_empleador_seed.json'],
];

function loadEnvFiles() {
  const backendEnv = path.join(backendRoot, '.env');
  if (fs.existsSync(backendEnv)) require('dotenv').config({ path: backendEnv });
  if (fs.existsSync(frontEnvPath)) require('dotenv').config({ path: frontEnvPath });
}

function credentials() {
  const url = (process.env.SUPABASE_URL || LOCAL_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || LOCAL_SERVICE_ROLE_KEY || '').trim();
  return { url, key };
}

async function upsertById(url, key, table, row) {
  const endpoint = `${url}/rest/v1/${table}?on_conflict=id`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table}: ${res.status} ${text}`);
  }
  console.log('OK', table, 'upsert id=', row.id);
}

async function upsertUserByUsername(url, key, row) {
  const endpoint = `${url}/rest/v1/users?on_conflict=username`;
  const res = await fetch(endpoint, {
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
    throw new Error(`users: ${res.status} ${text}`);
  }
  const data = await res.json();
  const out = Array.isArray(data) ? data[0] : data;
  if (out && out.password) delete out.password;
  console.log('OK users', row.username, out || '(sin cuerpo)');
}

async function seedAllCms(url, key) {
  console.log('--- CMS (scripts/seed/*.json) ---\n');
  for (const [table, rel] of CMS_JOBS) {
    const seedPath = path.join(scriptsDir, rel);
    const row = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    await upsertById(url, key, table, row);
  }
  console.log('\nOK todas las tablas CMS');
}

function normalizeUserRow(raw) {
  const out = { ...raw };
  const plain = (out.password_plain || '').trim();
  delete out.password_plain;
  delete out.password;
  if (!plain) {
    throw new Error(
      'users_seed.json: falta password_plain (texto plano). El seed la convierte a bcrypt antes de guardar. Ver scripts/README.md'
    );
  }
  out.password = bcrypt.hashSync(plain, 10);
  return out;
}

function buildUserRowFromSeed() {
  const seedPath = path.join(seedDir, 'users_seed.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Falta ${seedPath}`);
  }
  const row = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  return normalizeUserRow(row);
}

async function seedUsers(url, key) {
  console.log('\n--- users (scripts/seed/users_seed.json) ---\n');
  const row = buildUserRowFromSeed();
  await upsertUserByUsername(url, key, row);
}

async function main() {
  loadEnvFiles();
  const { url, key } = credentials();
  if (!url || !key) {
    console.error(
      'Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env (backend o aliadas-front).'
    );
    process.exit(1);
  }

  if (process.argv.length > 2) {
    console.error('Uso: node scripts/supabase-seed.js');
    process.exit(1);
  }

  await seedAllCms(url, key);
  await seedUsers(url, key);
  console.log('\nListo. Noticias: node scripts/supabase-news-import.js\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
