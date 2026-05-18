const router = require('express').Router();
const { checkToken, checkAdmin } = require('../../middleware/auth');
const customersController = require('./customers.controller');

router.get('/', checkToken, checkAdmin, customersController.list);
router.delete(
  '/:idCustomer',
  checkToken,
  checkAdmin,
  customersController.remove
);
router.post('/create', checkToken, checkAdmin, customersController.create);

module.exports = router;
