const router = require('express').Router();
const EmpleadorModel = require('../../models/empleador.model');
const { checkToken, checkAdmin } = require('../middlewares');

// --------------- EMPLEADOR -----

//Ver contenido empleador
router.get('/:idContent', async (req, res) => {
    const { idContent } = req.params;
    try {
        const [results] = await EmpleadorModel.getEmpleadores(idContent);
        res.json(results[0])
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Actualizar Contenido empleador
router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await EmpleadorModel.updateEmpleador(id, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = router;