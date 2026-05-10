const router = require('express').Router();
const {
  fetchActiveCustomers,
  insertCustomer,
  softDeleteCustomer,
} = require('../../models/supabaseCustomers.model');

router.get('/', async (req, res) => {
  try {
    const rows = await fetchActiveCustomers();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/:idCustomer', async (req, res) => {
  const { idCustomer } = req.params;
  try {
    await softDeleteCustomer(idCustomer);
    res.json({ affectedRows: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const row = await insertCustomer(req.body);
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
