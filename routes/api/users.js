const router = require('express').Router();
const UsuarioModel = require('../../models/users.model');
const bcrypt = require('bcrypt');
const { checkToken, checkAdmin } = require('../middlewares');
const { createToken } = require('../../helpers/utils')

//--------------- RUTAS USUARIOS -----------------//

//Obtener todos los usuarios
router.get('/', checkToken, async (req, res) => {
    try {
        const [results] = await UsuarioModel.getAllUsers();
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Obtener usuario por Id
router.get('/:userId', checkToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const [results] = await UsuarioModel.getUserById(userId);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

router.get('/email/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const [results] = await UsuarioModel.getUserByEmail(email);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Crear un usuario
router.post('/create', checkToken, checkAdmin, async (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    try {
        const [results] = await UsuarioModel.createUser(req.body);
        res.json(results);
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Login de Usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [results] = await UsuarioModel.getUserByEmail(email);
    if (results.length === 0 || email === "" || password === "") {
        return res.json({ error: 'Error en usuario o contraseña' })
    }
    const user = results[0];

    const equals = bcrypt.compareSync(password, user.password);

    //Para login correcto

    if (equals) {
        res.json({ success: 'Login correcto', token: createToken(user), roll: user.roll });
    } else {
        res.json({ error: "Error en email o contraseña" })
    }
})

//Editar usuario
router.put('/update/:userId', checkToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const results = await UsuarioModel.updateUser(userId, req.body);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

//Eliminar Usuario
router.get('/delete/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [results] = await UsuarioModel.deleteUserById(userId);
        res.json(results)
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = router;