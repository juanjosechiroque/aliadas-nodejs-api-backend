const router = require('express').Router();
const {
  fetchLibertadById,
  patchLibertadFromBody,
} = require('../../models/supabaseLibertadSindical.model');
const { checkToken, checkAdmin } = require('../middlewares');

//--------------- RUTAS LIBERTAD SINDICAL (Supabase cms_libertad_sindical) -----------------//

router.get('/:idContent', async (req, res) => {
  const { idContent } = req.params;
  try {
    const row = await fetchLibertadById(idContent);
    if (!row) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const out = await patchLibertadFromBody(id, req.body);
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
