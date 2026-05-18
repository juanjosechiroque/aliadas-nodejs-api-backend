const customersModel = require('./customers.model');

function list() {
  return customersModel.fetchActiveCustomers();
}

function create(body) {
  return customersModel.insertCustomer(body);
}

function remove(idCustomer) {
  return customersModel.softDeleteCustomer(idCustomer);
}

module.exports = {
  list,
  create,
  remove,
};
