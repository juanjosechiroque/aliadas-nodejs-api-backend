const router = require('express').Router();
const { checkToken, checkPanelAdmin } = require('../../middleware/auth');
const calculadoraController = require('./calculadora.controller');

router.get('/parametros', calculadoraController.list);
router.get('/parametros/:anio', calculadoraController.getByAnio);
router.post(
  '/parametros',
  checkToken,
  checkPanelAdmin,
  calculadoraController.create
);
router.patch(
  '/parametros/:anio',
  checkToken,
  checkPanelAdmin,
  calculadoraController.update
);
router.delete(
  '/parametros/:anio',
  checkToken,
  checkPanelAdmin,
  calculadoraController.remove
);

module.exports = router;
