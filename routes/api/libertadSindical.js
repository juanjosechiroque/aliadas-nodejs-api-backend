const router = require('express').Router();
const LibertadModel = require('../../models/libertadsindical.model');
const { checkToken, checkAdmin } = require('../middlewares');

//--------------- RUTAS LIBERTAD SINDICAL -----------------//

//Ver contenido Libertad Sindical
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params;
    try {
        const [results] = await LibertadModel.getLibertadById(idContent);
        res.json(results[0]);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido Libertad Sindical
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const results = await LibertadModel.updateLibertad(id, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = router;