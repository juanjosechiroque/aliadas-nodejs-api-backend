const router = require('express').Router();
const EnfermedadesModel = require('../../../models/misderechos/enfermedades.model');
const { checkToken, checkAdmin } = require('../../middlewares');
//--------------- ENFERMEDADES Y ACCIDENTES -----------------//

//Ver contenido Salario
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params;
    try {
        const [results] = await EnfermedadesModel.getEnfermedades(idContent);
        res.json(results[0]);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido Salario
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await EnfermedadesModel.updateEnfermedades(id, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})


module.exports = router;