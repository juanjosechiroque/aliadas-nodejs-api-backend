const router = require('express').Router();
const {
  fetchSeguridadSocialById,
  patchSeguridadSocialFromBody,
} = require('../../../models/supabaseSeguridadSocial.model');
const { checkToken, checkAdmin } = require('../../middlewares');

router.get('/:idContent', async (req, res) => {
  const { idContent } = req.params;
  try {
    const row = await fetchSeguridadSocialById(idContent);
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
    const out = await patchSeguridadSocialFromBody(id, req.body);
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
