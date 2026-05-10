const router = require('express').Router();
const apiUsersRouter = require('./api/users');
const apiActualidadRouter = require('./api/actualidad');
const apiViolenciaAcosoRouter = require('./api/violenciaAcoso');
const apiLibertadSindicalRouter = require('./api/libertadSindical');
const apiTrabajoDomesticoRouter = require('./api/misderechos/trabajodomestico');
const apiContratacionRouter = require('./api/misderechos/contratacion');
const apiJornadaRouter = require('./api/misderechos/jornada');
const apiSalario = require('./api/misderechos/salario');
const apiSeguridad = require('./api/misderechos/seguridad');
const apiBeneficios = require('./api/misderechos/beneficios');
const apiEnfermedades = require('./api/misderechos/enfermedades');
const apiLicencias = require('./api/misderechos/licencias');
const apiEmpleador = require('./api/empleador');
const apiCustomers = require('./api/customers');

router.use('/users', apiUsersRouter);
router.use('/actualidad', apiActualidadRouter);
router.use('/violenciaacoso', apiViolenciaAcosoRouter);
router.use('/libertadsindical', apiLibertadSindicalRouter);
router.use('/trabajodomestico', apiTrabajoDomesticoRouter);
router.use('/contratacion', apiContratacionRouter);
router.use('/jornada', apiJornadaRouter);
router.use('/salario', apiSalario);
router.use('/seguridad', apiSeguridad);
router.use('/beneficios', apiBeneficios);
router.use('/enfermedades', apiEnfermedades);
router.use('/licencias', apiLicencias);
router.use('/empleador', apiEmpleador);
router.use('/customers', apiCustomers);



module.exports = router;