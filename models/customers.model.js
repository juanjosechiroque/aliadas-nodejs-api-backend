/** @deprecated Clientes en MySQL; la API usa `supabaseCustomers.model.js` y `public.customers`. */
const db = require('../config/db').promise();

//-------------------- CUSTOMERS MODEL ------------//

//Listar todos los clientes
const getCustomers = () => {
    return db.query('SELECT * FROM customers WHERE isDelete = 0')
};

const createCustomer = ({ tipo, isDelete, fecha }) => {
    return db.query('INSERT INTO customers(tipo, isDelete, fecha) VALUES (?,?,?)', [tipo, 0, fecha])
}

const deleteCustomer = (idCustomer) => {
    return db.query('DELETE FROM customers WHERE id = ?', [idCustomer]);
}

module.exports = {
    getCustomers, createCustomer, deleteCustomer
}