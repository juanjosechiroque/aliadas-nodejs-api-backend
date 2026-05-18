const usersService = require('./users.service');
const { sendServerError } = require('../../utils/api-errors');
const {
  setAuthCookie,
  clearAuthCookie,
} = require('../../middleware/auth-cookie');
const { cookieMaxAgeMsFromExpiresIn } = require('../../utils/jwt');
const { jwtExpiresIn } = require('../../config');

async function list(_req, res) {
  try {
    const rows = await usersService.listActiveUsersSafe();
    res.json(rows);
  } catch (error) {
    sendServerError(res, error, 'users.list');
  }
}

async function getByUsername(req, res) {
  try {
    const row = await usersService.findByUsernameForLookup(req.params.username);
    if (!row) {
      return res.json([]);
    }
    res.json([row]);
  } catch (error) {
    sendServerError(res, error, 'users.getByUsername');
  }
}

async function create(req, res) {
  try {
    const row = await usersService.createUser(req.body);
    if (!row) {
      return res.status(500).json({ error: 'No se pudo crear el usuario' });
    }
    res.json(row);
  } catch (error) {
    sendServerError(res, error, 'users.create');
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const result = await usersService.login(username, password);
    if (!result.ok) {
      return res.status(401).json({ error: 'Error en usuario o contraseña' });
    }
    const maxAge = cookieMaxAgeMsFromExpiresIn(jwtExpiresIn);
    setAuthCookie(res, result.token, maxAge);
    res.json({
      success: 'Login correcto',
      token: result.token,
      rol_type: result.rol_type,
      user: result.user,
    });
  } catch (error) {
    sendServerError(res, error, 'users.login');
  }
}

async function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}
async function me(req, res) {
  res.json(req.user);
}

async function getById(req, res) {
  const { userId } = req.params;
  const isAdmin = req.user.rol_type === 'admin';
  const isSelf = String(req.user.id) === String(userId);
  if (!isAdmin && !isSelf) {
    return res
      .status(403)
      .json({ error: 'No puedes ver el perfil de otro usuario' });
  }
  try {
    const row = await usersService.getByIdSafe(userId);
    if (!row) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(row);
  } catch (error) {
    sendServerError(res, error, 'users.getById');
  }
}

async function remove(req, res) {
  try {
    await usersService.softDelete(req.params.userId);
    res.json({ affectedRows: 1 });
  } catch (error) {
    sendServerError(res, error, 'users.remove');
  }
}

async function patch(req, res) {
  const { userId } = req.params;
  if (String(req.user.id) !== String(userId)) {
    return res
      .status(403)
      .json({ error: 'Solo puedes modificar tu propio perfil.' });
  }
  try {
    const row = await usersService.patchUser(userId, req.body);
    res.json(row);
  } catch (error) {
    sendServerError(res, error, 'users.patch');
  }
}

module.exports = {
  list,
  getByUsername,
  create,
  login,
  logout,
  me,
  getById,
  remove,
  patch,
};
