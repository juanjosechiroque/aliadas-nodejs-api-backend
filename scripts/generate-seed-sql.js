/**
 * Genera seed_aliadas.sql leyendo api-data-mapping.json.
 * Uso: node scripts/generate-seed-sql.js
 * Salida: scripts/seed_aliadas.sql
 */

const fs   = require('fs');
const path = require('path');

const MAPPING_PATH = path.join(__dirname, '../../api-data-mapping.json');
const OUT_PATH     = path.join(__dirname, 'seed_aliadas.sql');

// Configuración ruta API → tabla + columnas (en orden de inserción)
const RESOURCE_CONFIG = {
  trabajodomestico: {
    table:   'misderechos_trabajodomestico',
    columns: ['url', 'descripcion', ...pairs(10)],
  },
  contratacion: {
    table:   'misderechos_contratacion',
    columns: ['descripcion', ...pairs(10)],
  },
  jornada: {
    table:   'misderechos_jornada',
    columns: ['descripcion', ...pairs(10)],
  },
  salario: {
    table:   'misderechos_salario',
    columns: ['descripcion', ...pairs(10)],
  },
  seguridad: {
    table:   'misderechos_seguridadsocial',
    columns: ['descripcion', ...pairs(17)],
  },
  beneficios: {
    table:   'misderechos_beneficios',
    columns: ['descripcion', ...pairs(20)],
  },
  licencias: {
    table:   'misderechos_licencias',
    columns: ['descripcion', ...pairs(21)],
  },
  enfermedades: {
    table:   'misderechos_enfermedades',
    columns: ['descripcion', ...pairs(12)],
  },
  libertadsindical: {
    table:   'libertad_sindical',
    columns: ['descripcion', ...pairs(10)],
  },
  violenciaacoso: {
    table:   'violencia_acoso',
    columns: ['descripcion', ...pairs(10)],
  },
  empleador: {
    table:   'empleador',
    columns: ['generalidades', ...qa(10)],
  },
};

function pairs(n) {
  const out = [];
  for (let i = 1; i <= n; i++) out.push(`titulo_${i}`, `texto_${i}`);
  return out;
}

function qa(n) {
  const out = [];
  for (let i = 1; i <= n; i++) out.push(`pregunta${i}`, `respuesta${i}`);
  return out;
}

function esc(v) {
  if (v === null || v === undefined) return "''";
  return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function resourceFromEndpoint(ep) {
  const raw = ep.GET || ep.GET_detail || '';
  const m   = String(raw).match(/\/api\/([^/?]+)/);
  return m ? m[1] : null;
}

function buildContentInsert(ep) {
  const resource = resourceFromEndpoint(ep);
  if (!resource || !RESOURCE_CONFIG[resource]) return null;
  if (!ep.response || typeof ep.response !== 'object' || Array.isArray(ep.response)) return null;

  const { table, columns } = RESOURCE_CONFIG[resource];
  const row  = ep.response;
  const id   = row.id != null ? Number(row.id) : 1;

  const allCols  = ['id', ...columns];
  const allVals  = [id, ...columns.map(c => row[c] != null ? row[c] : '')];

  const colList  = allCols.map(c => `\`${c}\``).join(', ');
  const valList  = allVals.map(esc).join(',\n  ');
  const updates  = columns.map(c => `\`${c}\`=VALUES(\`${c}\`)`).join(', ');

  return (
    `-- ${table}\n` +
    `INSERT INTO \`${table}\` (${colList})\nVALUES (\n  ${valList}\n)\n` +
    `ON DUPLICATE KEY UPDATE ${updates};\n`
  );
}

function buildActualidadInsert(ep) {
  if (!ep || !ep.response_detail) return null;
  const d = ep.response_detail;
  return (
    `-- actualidad (fila de ejemplo)\n` +
    `INSERT INTO \`actualidad\` (\`id\`,\`titulo\`,\`imagen\`,\`contenido\`,\`isDelete\`,\`fecha\`)\n` +
    `VALUES (${d.id}, ${esc(d.titulo)}, ${esc(d.imagen)}, ${esc(d.contenido)}, ${d.isDelete ?? 0}, '${d.fecha.replace('T',' ').replace('Z','')}')\n` +
    `ON DUPLICATE KEY UPDATE \`titulo\`=VALUES(\`titulo\`), \`imagen\`=VALUES(\`imagen\`), \`contenido\`=VALUES(\`contenido\`), \`isDelete\`=VALUES(\`isDelete\`), \`fecha\`=VALUES(\`fecha\`);\n`
  );
}

function buildCustomersInsert(ep) {
  if (!ep || !Array.isArray(ep.response_list)) return null;
  const rows = ep.response_list
    .map(r => `  (${r.id}, ${esc(r.tipo)}, ${r.isDelete ?? 0}, '${r.fecha.replace('T',' ').replace('Z','')}')`)
    .join(',\n');
  return (
    `-- customers (filas de ejemplo)\n` +
    `INSERT INTO \`customers\` (\`id\`,\`tipo\`,\`isDelete\`,\`fecha\`)\nVALUES\n${rows}\n` +
    `ON DUPLICATE KEY UPDATE \`tipo\`=VALUES(\`tipo\`), \`isDelete\`=VALUES(\`isDelete\`), \`fecha\`=VALUES(\`fecha\`);\n`
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

const data      = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));
const endpoints = data.endpoints || [];

const header = `-- ============================================================
--  seed_aliadas.sql  (generado por generate-seed-sql.js)
--  Fuente: api-data-mapping.json
--
--  Mapeo ruta → tabla:
--    /api/trabajodomestico  → misderechos_trabajodomestico
--    /api/contratacion      → misderechos_contratacion
--    /api/jornada           → misderechos_jornada
--    /api/salario           → misderechos_salario
--    /api/seguridad         → misderechos_seguridadsocial
--    /api/beneficios        → misderechos_beneficios
--    /api/licencias         → misderechos_licencias
--    /api/enfermedades      → misderechos_enfermedades
--    /api/libertadsindical  → libertad_sindical
--    /api/violenciaacoso    → violencia_acoso
--    /api/empleador         → empleador
--    /api/actualidad        → actualidad
--    /api/customers         → customers
--
--  Idempotente: INSERT … ON DUPLICATE KEY UPDATE.
--  Requiere que las tablas ya existan.
--  Ejecutar:  mysql -u<user> -p <db_name> < seed_aliadas.sql
-- ============================================================

SET NAMES utf8mb4;

`;

const parts = [header];

for (const ep of endpoints) {
  if (!ep || typeof ep !== 'object') continue;

  // Secciones de contenido (GET/response simple)
  const sql = buildContentInsert(ep);
  if (sql) { parts.push(sql + '\n'); continue; }

  // actualidad
  if (ep.GET_list && String(ep.GET_list).includes('/api/actualidad/')) {
    const sql = buildActualidadInsert(ep);
    if (sql) parts.push(sql + '\n');
    continue;
  }

  // customers
  if (ep.route && String(ep.route).includes('customers')) {
    const sql = buildCustomersInsert(ep);
    if (sql) parts.push(sql + '\n');
    continue;
  }
}

fs.writeFileSync(OUT_PATH, parts.join(''), 'utf8');
console.log('Generado:', OUT_PATH);
