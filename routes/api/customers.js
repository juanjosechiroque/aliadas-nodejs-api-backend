const router = require('express').Router();
const CustomerModel = require('../../models/customers.model');

//----------------- RUTAS CUSTOMERS ----------------//

//Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const [results] = await CustomerModel.getCustomers();
        res.json(results);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Eliminar Customer
router.delete('/delete/:idCustomer', async (req, res) => {
    const { idCustomer } = req.params;
    console.log(idCustomer)
    try {
        const [results] = await CustomerModel.deleteCustomer(idCustomer);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Crear un customer
router.post('/create', async (req, res) => {
    try {
        const [results] = await CustomerModel.createCustomer(req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = router