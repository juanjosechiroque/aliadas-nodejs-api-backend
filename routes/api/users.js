const router = require('express').Router();
const bcrypt = require('bcrypt');
const supabaseUsers = require('../../models/supabaseUsers.model');
const { checkToken, checkAdmin } = require('../middlewares');
const { createToken } = require('../../helpers/utils');

router.get('/', checkToken, async (req, res) => {
  try {
    const rows = await supabaseUsers.fetchAllActiveUsers();
    res.json(rows.map(({ password: _p, ...u }) => u));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/username/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const row = await supabaseUsers.fetchUserByUsername(username);
    if (!row) {
      return res.json([]);
    }
    const { password: _p, ...safe } = row;
    res.json([safe]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/delete/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await supabaseUsers.softDeleteUser(userId);
    res.json({ affectedRows: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', checkToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const row = await supabaseUsers.fetchUserById(userId);
    if (!row) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const { password: _p, ...safe } = row;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', checkToken, checkAdmin, async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);
    const row = await supabaseUsers.insertUser({
      name: req.body.name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hash,
      rol_type: req.body.rol_type || 'user',
      is_deleted: false,
    });
    if (!row) {
      return res.status(500).json({ error: 'No se pudo crear el usuario' });
    }
    const { password: _p, ...safe } = row;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ error: 'Error en usuario o contraseña' });
  }
  try {
    const user = await supabaseUsers.fetchUserByUsername(username);
    if (!user) {
      return res.json({ error: 'Error en usuario o contraseña' });
    }
    const equals = bcrypt.compareSync(password, user.password);
    if (equals) {
      const { password: _p, ...safe } = user;
      res.json({
        success: 'Login correcto',
        token: createToken(user),
        rol_type: user.rol_type,
        user: safe,
      });
    } else {
      res.json({ error: 'Error en usuario o contraseña' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update/:userId', checkToken, async (req, res) => {
  const { userId } = req.params;
  const body = { ...req.body };
  if (body.password) {
    body.password = bcrypt.hashSync(body.password, 10);
  }
  delete body.id;
  try {
    const row = await supabaseUsers.patchUser(userId, body);
    if (row && row.password) {
      const { password: _p, ...safe } = row;
      return res.json(safe);
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
