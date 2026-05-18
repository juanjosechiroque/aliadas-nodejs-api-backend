const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { checkToken, checkAdmin } = require('../../middleware/auth');
const usersController = require('./users.controller');

const loginLimiter = rateLimit({
  windowMs:
    Number.parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || '', 10) ||
    15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '', 10) || 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      'Demasiados intentos de inicio de sesión. Prueba de nuevo en unos minutos.',
  },
});

router.post('/login', loginLimiter, usersController.login);
router.post('/logout', usersController.logout);
router.get('/me', checkToken, usersController.me);

router.get('/', checkToken, checkAdmin, usersController.list);
router.get(
  '/username/:username',
  checkToken,
  checkAdmin,
  usersController.getByUsername
);
router.post('/create', checkToken, checkAdmin, usersController.create);
router.get('/:userId', checkToken, usersController.getById);
router.delete('/:userId', checkToken, checkAdmin, usersController.remove);
router.patch('/:userId', checkToken, usersController.patch);

module.exports = router;
