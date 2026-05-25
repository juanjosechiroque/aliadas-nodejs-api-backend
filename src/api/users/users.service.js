const bcrypt = require('bcrypt');
const userModel = require('./users.model');
const { createToken } = require('../../utils/jwt');

const SELF_UPDATE_FIELDS = ['name', 'last_name', 'username', 'password'];
const ADMIN_UPDATE_FIELDS = [
  'name',
  'last_name',
  'username',
  'rol_type',
  'is_active',
];
const ALLOWED_PANEL_ROLES = ['admin', 'cms_admin'];

function stripPassword(user) {
  if (!user) {
    return user;
  }
  const { password: _p, ...safe } = user;
  return safe;
}

function isUserActive(user) {
  return user && user.is_active !== false;
}

function normalizePanelRole(rolType) {
  const role = (rolType || 'cms_admin').trim();
  if (!ALLOWED_PANEL_ROLES.includes(role)) {
    throw Object.assign(new Error('Rol no permitido para el panel.'), {
      statusCode: 400,
    });
  }
  return role;
}

async function countActiveAdmins() {
  const rows = await userModel.fetchAllActiveUsers();
  return rows.filter((row) => row.rol_type === 'admin' && isUserActive(row))
    .length;
}

async function listActiveUsersSafe() {
  const rows = await userModel.fetchAllActiveUsers();
  return rows.map(stripPassword);
}

async function findByUsernameForLookup(username) {
  const row = await userModel.fetchUserByUsername(username);
  if (!row) {
    return null;
  }
  return stripPassword(row);
}

async function getByIdSafe(id) {
  const row = await userModel.fetchUserById(id);
  if (!row || row.is_deleted) {
    return null;
  }
  return stripPassword(row);
}

async function assertCanDeactivateOrDeleteAdmin(target) {
  if (target.rol_type === 'admin' && isUserActive(target)) {
    const adminCount = await countActiveAdmins();
    if (adminCount <= 1) {
      throw Object.assign(
        new Error(
          'No se puede desactivar ni eliminar el último administrador activo.'
        ),
        { statusCode: 400 }
      );
    }
  }
}

async function softDelete(id, actorId) {
  if (String(actorId) === String(id)) {
    throw Object.assign(new Error('No puedes eliminar tu propia cuenta.'), {
      statusCode: 400,
    });
  }

  const target = await userModel.fetchUserById(id);
  if (!target || target.is_deleted) {
    throw Object.assign(new Error('Usuario no encontrado.'), {
      statusCode: 404,
    });
  }

  await assertCanDeactivateOrDeleteAdmin(target);
  await userModel.softDeleteUser(id);
}

async function createUser(body) {
  if (!body?.username || !body?.password) {
    throw Object.assign(new Error('Usuario y contraseña son obligatorios.'), {
      statusCode: 400,
    });
  }

  if (String(body.password).length < 6) {
    throw Object.assign(
      new Error('La contraseña debe tener al menos 6 caracteres.'),
      { statusCode: 400 }
    );
  }

  const rol_type = normalizePanelRole(body.rol_type);
  const hash = await bcrypt.hash(body.password, 10);
  try {
    const row = await userModel.insertUser({
      name: body.name,
      last_name: body.last_name,
      username: body.username,
      password: hash,
      rol_type,
      is_deleted: false,
      is_active: true,
    });
    return row ? stripPassword(row) : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/duplicate key|unique constraint|users_username/i.test(message)) {
      throw Object.assign(new Error('Ese nombre de usuario ya existe.'), {
        statusCode: 400,
      });
    }
    if (/is_active|column/i.test(message)) {
      throw Object.assign(
        new Error(
          'Falta la columna is_active en la base de datos. Ejecuta la migración en Supabase.'
        ),
        { statusCode: 500 }
      );
    }
    throw error;
  }
}

async function login(username, password) {
  if (!username || !password) {
    return { ok: false };
  }
  const user = await userModel.fetchUserByUsername(username);
  if (!user || !isUserActive(user)) {
    return { ok: false };
  }
  const equals = await bcrypt.compare(password, user.password);
  if (!equals) {
    return { ok: false };
  }
  const safe = stripPassword(user);
  return {
    ok: true,
    token: createToken(user),
    rol_type: user.rol_type,
    user: safe,
  };
}

async function patchUser(userId, body) {
  const payload = {};
  for (const key of SELF_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      payload[key] = body[key];
    }
  }
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  const row = await userModel.patchUser(userId, payload);
  if (row && row.password) {
    return stripPassword(row);
  }
  return row;
}

async function changePasswordByAdmin(userId, password) {
  if (!password || String(password).length < 6) {
    throw Object.assign(
      new Error('La contraseña debe tener al menos 6 caracteres.'),
      { statusCode: 400 }
    );
  }

  const existing = await userModel.fetchUserById(userId);
  if (!existing || existing.is_deleted) {
    throw Object.assign(new Error('Usuario no encontrado.'), {
      statusCode: 404,
    });
  }

  const hash = await bcrypt.hash(password, 10);
  const row = await userModel.patchUser(userId, { password: hash });
  return row ? stripPassword(row) : stripPassword(existing);
}

async function patchUserByAdmin(userId, body, actorId) {
  const existing = await userModel.fetchUserById(userId);
  if (!existing || existing.is_deleted) {
    throw Object.assign(new Error('Usuario no encontrado.'), {
      statusCode: 404,
    });
  }

  const payload = {};
  for (const key of ADMIN_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      payload[key] = body[key];
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'rol_type')) {
    payload.rol_type = normalizePanelRole(payload.rol_type);

    if (
      String(actorId) === String(userId) &&
      payload.rol_type !== existing.rol_type
    ) {
      throw Object.assign(
        new Error('No puedes cambiar tu propio rol desde el panel.'),
        { statusCode: 400 }
      );
    }

    if (existing.rol_type === 'admin' && payload.rol_type !== 'admin') {
      const adminCount = await countActiveAdmins();
      if (adminCount <= 1 && isUserActive(existing)) {
        throw Object.assign(
          new Error(
            'No se puede cambiar el rol del último administrador activo.'
          ),
          { statusCode: 400 }
        );
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'is_active')) {
    const nextActive = Boolean(payload.is_active);
    if (String(actorId) === String(userId)) {
      delete payload.is_active;
    } else if (!nextActive) {
      if (isUserActive(existing)) {
        await assertCanDeactivateOrDeleteAdmin(existing);
      }
    }
  }

  if (Object.keys(payload).length === 0) {
    return stripPassword(existing);
  }

  const row = await userModel.patchUser(userId, payload);
  return row ? stripPassword(row) : stripPassword(existing);
}

module.exports = {
  listActiveUsersSafe,
  findByUsernameForLookup,
  getByIdSafe,
  softDelete,
  createUser,
  login,
  patchUser,
  patchUserByAdmin,
  changePasswordByAdmin,
};
