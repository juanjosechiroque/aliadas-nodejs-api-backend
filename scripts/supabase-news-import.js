#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dotenv = require('dotenv');

const scriptsDir = __dirname;
const backendRoot = path.join(scriptsDir, '..');
const frontSiblingAssets = path.join(
  backendRoot,
  '..',
  'aliadas-front',
  'src',
  'assets'
);

dotenv.config({ path: path.join(backendRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '..', 'aliadas-front', '.env') });

const jsonPath =
  (process.env.NOTICIAS_JSON || '').trim() ||
  path.join(scriptsDir, 'seed', 'news_seed.json');

const assetsRoot =
  (process.env.NOTICIAS_ASSETS_ROOT || '').trim() || frontSiblingAssets;

const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const bucket = (process.env.SUPABASE_NEWS_BUCKET || 'aliadas-news').trim();

if (!supabaseUrl || !serviceKey) {
  console.error(
    'Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env (backend o aliadas-front).'
  );
  process.exit(1);
}

function mimeFromFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

async function compressKeepingFormat(localPath, inputBuffer) {
  const ext = path.extname(localPath).toLowerCase();
  const mime = mimeFromFilename(localPath);

  if (ext === '.gif') {
    return { buffer: inputBuffer, mime };
  }

  try {
    let out;

    if (ext === '.png') {
      out = await sharp(inputBuffer)
        .png({ compressionLevel: 9, effort: 10 })
        .toBuffer();
    } else if (ext === '.webp') {
      out = await sharp(inputBuffer)
        .webp({ quality: 92, effort: 6, smartSubsample: true })
        .toBuffer();
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.jpe') {
      out = await sharp(inputBuffer)
        .jpeg({
          quality: 92,
          mozjpeg: true,
          chromaSubsampling: '4:4:4',
        })
        .toBuffer();
    } else {
      return { buffer: inputBuffer, mime };
    }

    const buffer = out.length < inputBuffer.length ? out : inputBuffer;
    return { buffer, mime };
  } catch {
    return { buffer: inputBuffer, mime };
  }
}

function storageObjectPath(imageUrlField) {
  const normalized = imageUrlField.replace(/^\/+/, '').replace(/^assets\//, '');
  return normalized.split('/').filter(Boolean).join('/');
}

function publicObjectUrl(objectPath) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
}

async function uploadToStorage(objectPath, fileBuffer, contentType) {
  const enc = objectPath.split('/').map(encodeURIComponent).join('/');
  const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${enc}`;

  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload ${objectPath}: ${res.status} ${text}`);
  }
}

async function insertNewsRow(body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/news`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`REST insert: ${res.status} ${text}`);
  }
}

async function assertNewsTableExists() {
  const url = `${supabaseUrl}/rest/v1/news?select=id&limit=0`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json',
    },
  });

  if (res.ok) return;

  const raw = await res.text();
  let detail = raw;
  try {
    const j = JSON.parse(raw);
    if (j.message) detail = j.message;
    if (j.code) detail = `${j.code}: ${detail}`;
  } catch {
    /* texto plano */
  }

  console.error(`
La tabla public.news no está disponible por la API REST (${res.status}).

Ejecutá primero en SQL Editor: aliadas-nodejs-api-backend/scripts/supabase-schema.sql

Detalle: ${detail}
`);
  process.exit(1);
}

async function main() {
  await assertNewsTableExists();

  if (!fs.existsSync(jsonPath)) {
    console.error('No existe el JSON:', jsonPath);
    process.exit(1);
  }
  if (!fs.existsSync(assetsRoot)) {
    console.error(
      'No existe la carpeta de imágenes:',
      assetsRoot,
      '\nDefiní NOTICIAS_ASSETS_ROOT apuntando a la carpeta que contiene los archivos de imageUrl (p. ej. .../aliadas-front/src/assets).'
    );
    process.exit(1);
  }

  console.log('JSON:', jsonPath);
  console.log('Assets:', assetsRoot);

  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const row of rows) {
    const objectPath = storageObjectPath(row.imageUrl);
    const localPath = path.join(assetsRoot, objectPath);

    if (!fs.existsSync(localPath)) {
      console.error('No existe el archivo local:', localPath);
      console.error('  (según imageUrl del JSON:', row.imageUrl, ')');
      process.exit(1);
    }

    const buf = fs.readFileSync(localPath);
    const { buffer: optimized, mime } = await compressKeepingFormat(
      localPath,
      buf
    );
    if (optimized.length < buf.length) {
      console.log(
        `  Optimizada: ${(buf.length / 1024).toFixed(1)} KB → ${(optimized.length / 1024).toFixed(1)} KB`
      );
    }

    console.log('Subiendo Storage:', objectPath);
    await uploadToStorage(objectPath, optimized, mime);

    const imagePublicUrl = publicObjectUrl(objectPath);

    const payload = {
      title: row.title,
      description: row.description,
      date: row.date,
      url: row.url,
      imageUrl: imagePublicUrl,
    };

    console.log('Insertando news:', row.title.slice(0, 55) + '…');
    await insertNewsRow(payload);
  }

  console.log(
    `Listo: ${rows.length} imágenes en bucket "${bucket}" y ${rows.length} filas en news.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
