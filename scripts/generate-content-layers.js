#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'api');

const modules = [
  {
    rel: 'misderechos/jornada',
    base: 'jornada',
    fetch: 'fetchJornadaById',
    patch: 'patchJornadaFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/salario',
    base: 'salario',
    fetch: 'fetchSalarioById',
    patch: 'patchSalarioFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/seguridad',
    base: 'seguridad',
    fetch: 'fetchSeguridadSocialById',
    patch: 'patchSeguridadSocialFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/beneficios',
    base: 'beneficios',
    fetch: 'fetchBeneficiosById',
    patch: 'patchBeneficiosFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/enfermedades',
    base: 'enfermedades',
    fetch: 'fetchEnfermedadesById',
    patch: 'patchEnfermedadesFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/licencias',
    base: 'licencias',
    fetch: 'fetchLicenciasById',
    patch: 'patchLicenciasFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/contratacion',
    base: 'contratacion',
    fetch: 'fetchContratacionById',
    patch: 'patchContratacionFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'misderechos/trabajodomestico',
    base: 'trabajodomestico',
    fetch: 'fetchTrabajoDomesticoById',
    patch: 'patchTrabajoDomesticoFromBody',
    auth: '../../../middleware/auth',
  },
  {
    rel: 'violenciaAcoso',
    base: 'violenciaAcoso',
    fetch: 'fetchViolenciaById',
    patch: 'patchViolenciaFromBody',
    auth: '../../middleware/auth',
  },
  {
    rel: 'libertadSindical',
    base: 'libertadSindical',
    fetch: 'fetchLibertadById',
    patch: 'patchLibertadFromBody',
    auth: '../../middleware/auth',
  },
  {
    rel: 'empleador',
    base: 'empleador',
    fetch: 'fetchEmpleadorById',
    patch: 'patchEmpleadorFromBody',
    auth: '../../middleware/auth',
  },
];
function utilsRequirePrefix(rel) {
  const depthUnderApi = rel.split('/').length;
  return `${'../'.repeat(depthUnderApi + 1)}utils/`;
}

function serviceFile({ base, fetch, patch, rel }) {
  const utils = utilsRequirePrefix(rel);
  return `const model = require('./${base}.model');
const { sanitizeCmsRow, sanitizeCmsPatchBody } = require('${utils}cms-rich-fields');

async function getById(id) {
  const row = await model.${fetch}(id);
  return row ? sanitizeCmsRow(row) : null;
}

async function patchContent(id, body) {
  return model.${patch}(id, sanitizeCmsPatchBody(body));
}

module.exports = {
  getById,
  patchContent,
};
`;
}

function controllerFile({ base, rel }) {
  const utils = utilsRequirePrefix(rel);
  return `const service = require('./${base}.service');
const { sendServerError } = require('${utils}api-errors');

async function getById(req, res) {
  const { idContent } = req.params;
  try {
    const row = await service.getById(idContent);
    if (!row) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    res.json(row);
  } catch (error) {
    sendServerError(res, error, '${base}.getById');
  }
}

async function patch(req, res) {
  const { id } = req.params;
  try {
    const out = await service.patchContent(id, req.body);
    res.json(out);
  } catch (error) {
    sendServerError(res, error, '${base}.patch');
  }
}

module.exports = {
  getById,
  patch,
};
`;
}

function routerFile({ base, auth }) {
  return `const router = require('express').Router();
const { checkToken, checkAdmin } = require('${auth}');
const controller = require('./${base}.controller');

router.get('/:idContent', controller.getById);
router.patch('/:id', checkToken, checkAdmin, controller.patch);

module.exports = router;
`;
}

for (const m of modules) {
  const dir = path.join(root, m.rel);
  fs.writeFileSync(path.join(dir, `${m.base}.service.js`), serviceFile(m));
  fs.writeFileSync(
    path.join(dir, `${m.base}.controller.js`),
    controllerFile(m)
  );
  fs.writeFileSync(path.join(dir, `${m.base}.router.js`), routerFile(m));
}

console.log('OK:', modules.length, 'módulos CMS');
