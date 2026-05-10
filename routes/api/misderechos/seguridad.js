const router = require('express').Router();
const SeguridadModel = require('../../../models/misderechos/seguridad.model');
const { checkToken, checkAdmin } = require('../../middlewares');
//--------------- SEGURIDAD SOCIAL -----------------//

//Ver contenido Salario
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params;
    try {
        const [results] = await SeguridadModel.getSeguridad(idContent);
        res.json(results[0]);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido Salario
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await SeguridadModel.updateSeguridad(id, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})



module.exports = router;