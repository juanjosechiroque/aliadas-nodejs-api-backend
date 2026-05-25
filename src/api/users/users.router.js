const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const {
  checkToken,
  checkSecurityAdmin,
} = require('../../middleware/auth');
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

router.get('/', checkToken, checkSecurityAdmin, usersController.list);
router.get(
  '/username/:username',
  checkToken,
  checkSecurityAdmin,
  usersController.getByUsername
);
router.post('/create', checkToken, checkSecurityAdmin, usersController.create);
router.get('/:userId', checkToken, usersController.getById);
router.delete('/:userId', checkToken, checkSecurityAdmin, usersController.remove);
router.patch(
  '/:userId/admin/password',
  checkToken,
  checkSecurityAdmin,
  usersController.changePasswordByAdmin
);
router.patch('/:userId/admin', checkToken, checkSecurityAdmin, usersController.patchByAdmin);
router.patch('/:userId', checkToken, usersController.patch);

module.exports = router;
