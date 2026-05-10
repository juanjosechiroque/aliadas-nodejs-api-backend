const router = require('express').Router();
const ViolenciaModel = require('../../models/violenciaacoso.model');
const { checkToken, checkAdmin } = require('../middlewares');

//--------------- RUTAS VIOLENCIA Y ACOSO -----------------//

//Ver contenido Violencia y Acoso
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params
    try {
        const [results] = await ViolenciaModel.getById(idContent)
        res.json(results[0]);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido Violencia y Acoso
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const results = await ViolenciaModel.updateViolencia(id, req.body);
        console.log('console results', results)
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = router;