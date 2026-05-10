/**
 * Pobla las tablas MySQL de aliadas_back con el contenido documentado en api-data-mapping.json.
 * Funciona tanto en una base de datos vacía (INSERT) como sobre datos existentes (UPDATE).
 *
 * Mapeo ruta → tabla:
 *   /api/trabajodomestico  → misderechos_trabajodomestico
 *   /api/contratacion      → misderechos_contratacion
 *   /api/jornada           → misderechos_jornada
 *   /api/salario           → misderechos_salario
 *   /api/seguridad         → misderechos_seguridadsocial
 *   /api/beneficios        → misderechos_beneficios
 *   /api/licencias         → misderechos_licencias
 *   /api/enfermedades      → misderechos_enfermedades
 *   /api/libertadsindical  → libertad_sindical
 *   /api/violenciaacoso    → violencia_acoso
 *   /api/empleador         → empleador
 *   /api/actualidad        → actualidad        (solo con --demo-data)
 *   /api/customers         → customers         (solo con --demo-data)
 *
 * Uso (desde aliadas_back, con .env apuntando a la BD):
 *   node scripts/seed-from-api-mapping.js
 *   node scripts/seed-from-api-mapping.js --path /ruta/absoluta/api-data-mapping.json
 *   node scripts/seed-from-api-mapping.js --demo-data
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

/** Primer segmento de ruta tras /api/ → tabla y columnas permitidas en UPDATE (orden no importa). */
const RESOURCE_CONFIG = {
  trabajodomestico: {
    table: 'misderechos_trabajodomestico',
    columns: ['url', 'descripcion', ...pairCols(10)],
  },
  contratacion: {
    table: 'misderechos_contratacion',
    columns: ['descripcion', ...pairCols(10)],
  },
  jornada: {
    table: 'misderechos_jornada',
    columns: ['descripcion', ...pairCols(10)],
  },
  salario: {
    table: 'misderechos_salario',
    columns: ['descripcion', ...pairCols(10)],
  },
  seguridad: {
    table: 'misderechos_seguridadsocial',
    columns: ['descripcion', ...pairCols(17)],
  },
  beneficios: {
    table: 'misderechos_beneficios',
    columns: ['descripcion', ...pairCols(20)],
  },
  licencias: {
    table: 'misderechos_licencias',
    columns: ['descripcion', ...pairCols(21)],
  },
  enfermedades: {
    table: 'misderechos_enfermedades',
    columns: ['descripcion', ...pairCols(12)],
  },
  libertadsindical: {
    table: 'libertad_sindical',
    columns: ['descripcion', ...pairCols(10)],
  },
  violenciaacoso: {
    table: 'violencia_acoso',
    columns: ['descripcion', ...pairCols(10)],
  },
  empleador: {
    table: 'empleador',
    columns: [
      'generalidades',
      ...flatQa(10),
    ],
  },
};

function pairCols(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(`titulo_${i}`, `texto_${i}`);
  }
  return out;
}

function flatQa(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(`pregunta${i}`, `respuesta${i}`);
  }
  return out;
}

function apiResourceFromEndpoint(ep) {
  const raw = ep.GET || ep.GET_detail || '';
  const m = String(raw).match(/\/api\/([^/?]+)/);
  return m ? m[1] : null;
}

function pickValues(row, columns) {
  const values = [];
  for (const col of columns) {
    let v = row[col];
    if (v === undefined || v === null) {
      v = '';
    }
    values.push(v);
  }
  return values;
}

async function seedContentRows(conn, endpoints) {
  for (const ep of endpoints) {
    if (!ep || typeof ep !== 'object') continue;

    const resource = apiResourceFromEndpoint(ep);
    if (!resource || !RESOURCE_CONFIG[resource]) continue;
    if (!ep.response || typeof ep.response !== 'object' || Array.isArray(ep.response)) continue;

    const { table, columns } = RESOURCE_CONFIG[resource];
    const id = ep.response.id != null ? Number(ep.response.id) : 1;
    const values = pickValues(ep.response, columns);
    const sets = columns.map((c) => `\`${c}\` = ?`).join(', ');
    const sql = `UPDATE \`${table}\` SET ${sets} WHERE id = ?`;
    await conn.query(sql, [...values, id]);
    console.log(`OK  ${table}  id=${id}  (${resource})`);
  }
}

async function seedDemoExtras(conn, endpoints) {
  const actualidadEp = endpoints.find(
    (e) => e && e.GET_list && String(e.GET_list).includes('/api/actualidad/')
  );
  const customersEp = endpoints.find(
    (e) => e && e.route && String(e.route).includes('customers')
  );

  if (actualidadEp && actualidadEp.response_detail) {
    const d = actualidadEp.response_detail;
    await conn.query(
      `INSERT INTO actualidad (id, titulo, imagen, contenido, isDelete, fecha)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), imagen = VALUES(imagen), contenido = VALUES(contenido), isDelete = VALUES(isDelete), fecha = VALUES(fecha)`,
      [d.id, d.titulo, d.imagen, d.contenido, d.isDelete ?? 0, new Date(d.fecha)]
    );
    console.log('OK  actualidad  (demo response_detail)');
  }

  if (customersEp && Array.isArray(customersEp.response_list)) {
    for (const row of customersEp.response_list) {
      await conn.query(
        `INSERT INTO customers (id, tipo, isDelete, fecha)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE tipo = VALUES(tipo), isDelete = VALUES(isDelete), fecha = VALUES(fecha)`,
        [row.id, row.tipo, row.isDelete ?? 0, new Date(row.fecha)]
      );
    }
    console.log('OK  customers  (demo response_list)');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const demoData = args.includes('--demo-data');
  let mappingPath = path.join(__dirname, '../../api-data-mapping.json');
  const pathIdx = args.indexOf('--path');
  if (pathIdx !== -1 && args[pathIdx + 1]) {
    mappingPath = path.resolve(args[pathIdx + 1]);
  }

  if (!fs.existsSync(mappingPath)) {
    console.error('No se encontró el JSON:', mappingPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(mappingPath, 'utf8');
  const data = JSON.parse(raw);
  const endpoints = data.endpoints || [];

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
  });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await seedContentRows(conn, endpoints);
    if (demoData) {
      await seedDemoExtras(conn, endpoints);
    }
    await conn.commit();
    console.log('\nListo: contenido "Mis derechos" y páginas relacionadas actualizado desde el mapping.');
    if (!demoData) {
      console.log('(Omitido actualidad/customers; usar --demo-data para insertarlos desde el JSON.)');
    }
  } catch (e) {
    await conn.rollback();
    console.error('Error:', e.message);
    if (e.sqlMessage) console.error('SQL:', e.sqlMessage);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
