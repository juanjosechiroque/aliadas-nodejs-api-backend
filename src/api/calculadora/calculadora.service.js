const model = require('./calculadora.model');

function parsePositiveInt(value, fieldName) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw Object.assign(new Error(`${fieldName} debe ser un número positivo.`), {
      statusCode: 400,
    });
  }
  return n;
}

function parseYear(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 2000 || n > 2100) {
    throw Object.assign(new Error('El año no es válido.'), {
      statusCode: 400,
    });
  }
  return n;
}

async function listActive() {
  return model.fetchAllActive();
}

async function getByYear(yearParam) {
  const year = parseYear(yearParam);
  const row = await model.fetchByYear(year);
  if (!row) {
    throw Object.assign(new Error('Parámetro no encontrado para ese año.'), {
      statusCode: 404,
    });
  }
  return row;
}

async function create(body) {
  const year = parseYear(body.year);
  const minimum_wage = parsePositiveInt(body.minimum_wage, 'Salario mínimo');
  const transport_allowance = parsePositiveInt(
    body.transport_allowance,
    'Auxilio de transporte'
  );

  const existing = await model.fetchByYear(year);
  if (existing && !existing.is_deleted) {
    throw Object.assign(new Error('Ya existen parámetros para ese año.'), {
      statusCode: 400,
    });
  }

  return model.upsertRow({
    year,
    minimum_wage,
    transport_allowance,
    is_deleted: false,
  });
}

async function update(yearParam, body) {
  const year = parseYear(yearParam);
  const existing = await model.fetchByYear(year);
  if (!existing) {
    throw Object.assign(new Error('Parámetro no encontrado para ese año.'), {
      statusCode: 404,
    });
  }

  const payload = {};
  if (body.minimum_wage != null) {
    payload.minimum_wage = parsePositiveInt(
      body.minimum_wage,
      'Salario mínimo'
    );
  }
  if (body.transport_allowance != null) {
    payload.transport_allowance = parsePositiveInt(
      body.transport_allowance,
      'Auxilio de transporte'
    );
  }

  if (Object.keys(payload).length === 0) {
    return existing;
  }

  return model.patchByYear(year, payload);
}

async function remove(yearParam) {
  const year = parseYear(yearParam);
  const existing = await model.fetchByYear(year);
  if (!existing) {
    throw Object.assign(new Error('Parámetro no encontrado para ese año.'), {
      statusCode: 404,
    });
  }
  await model.softDeleteByYear(year);
}

module.exports = {
  listActive,
  getByYear,
  create,
  update,
  remove,
};
