const router = require('express').Router();
const { checkToken, checkAdmin } = require('../../middleware/auth');
const actualidadController = require('./actualidad.controller');
const { handleCreateUpload } = require('./actualidad.middleware');

router.get('/', actualidadController.list);
router.delete(
  '/:noticiaId',
  checkToken,
  checkAdmin,
  actualidadController.remove
);
router.get('/:idContent', actualidadController.getById);
router.post(
  '/create',
  checkToken,
  checkAdmin,
  handleCreateUpload,
  actualidadController.create
);
router.patch('/:id', checkToken, checkAdmin, actualidadController.patch);

module.exports = router;
