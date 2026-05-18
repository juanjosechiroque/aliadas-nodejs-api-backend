const bcrypt = require('bcrypt');
const userModel = require('./users.model');
const { createToken } = require('../../utils/jwt');

const SELF_UPDATE_FIELDS = ['name', 'last_name', 'username', 'password'];

function stripPassword(user) {
  if (!user) {
    return user;
  }
  const { password: _p, ...safe } = user;
  return safe;
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
  if (!row) {
    return null;
  }
  return stripPassword(row);
}

async function softDelete(id) {
  await userModel.softDeleteUser(id);
}

async function createUser(body) {
  const hash = await bcrypt.hash(body.password, 10);
  const row = await userModel.insertUser({
    name: body.name,
    last_name: body.last_name,
    username: body.username,
    password: hash,
    rol_type: body.rol_type || 'user',
    is_deleted: false,
  });
  return row ? stripPassword(row) : null;
}
async function login(username, password) {
  if (!username || !password) {
    return { ok: false };
  }
  const user = await userModel.fetchUserByUsername(username);
  if (!user) {
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

module.exports = {
  listActiveUsersSafe,
  findByUsernameForLookup,
  getByIdSafe,
  softDelete,
  createUser,
  login,
  patchUser,
};
