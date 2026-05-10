const router = require('express').Router();
const ContratacionModel = require('../../../models/misderechos/contratacion.model');
const { checkToken, checkAdmin } = require('../../middlewares');
//--------------- CONTRATACION SINDICAL -----------------//

//Ver contenido Trabajo Doméstico
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params;
    try {
        const [results] = await ContratacionModel.getContratacion(idContent);
        res.json(results[0]);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido Trabajo Doméstico
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await ContratacionModel.updateContratacion(id, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})



module.exports = router;