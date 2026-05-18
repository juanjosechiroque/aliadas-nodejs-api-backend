const customersService = require('./customers.service');
const { sendServerError } = require('../../utils/api-errors');

async function list(_req, res) {
  try {
    const rows = await customersService.list();
    res.json(rows);
  } catch (error) {
    sendServerError(res, error, 'customers.list');
  }
}

async function remove(req, res) {
  try {
    await customersService.remove(req.params.idCustomer);
    res.json({ affectedRows: 1 });
  } catch (error) {
    sendServerError(res, error, 'customers.remove');
  }
}

async function create(req, res) {
  try {
    const row = await customersService.create(req.body);
    res.json(row);
  } catch (error) {
    sendServerError(res, error, 'customers.create');
  }
}

module.exports = {
  list,
  remove,
  create,
};
