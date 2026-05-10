const router = require('express').Router();
const TrabajoModel = require('../../../models/misderechos/trabajo.model');
const { checkToken, checkAdmin } = require('../../middlewares');
//--------------- TRABAJO DOMÉSTICO SINDICAL -----------------//

//Ver contenido Trabajo Doméstico
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params;
    try {
        const [results] = await TrabajoModel.getTrabajo(idContent);
        res.json(results[0]);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido Trabajo Doméstico
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await TrabajoModel.updateTrabajo(id, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})



module.exports = router;