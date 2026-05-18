const router = require('express').Router();
const { checkToken, checkAdmin } = require('../../../middleware/auth');
const controller = require('./contratacion.controller');

router.get('/:idContent', controller.getById);
router.patch('/:id', checkToken, checkAdmin, controller.patch);

module.exports = router;
