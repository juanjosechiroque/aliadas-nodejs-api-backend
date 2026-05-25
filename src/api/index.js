const router = require('express').Router();

const apiHealthRouter = require('./health/health.router');
const apiUsersRouter = require('./users/users.router');
const apiActualidadRouter = require('./actualidad/actualidad.router');
const apiViolenciaAcosoRouter = require('./violenciaAcoso/violenciaAcoso.router');
const apiLibertadSindicalRouter = require('./libertadSindical/libertadSindical.router');
const apiTrabajoDomesticoRouter = require('./misderechos/trabajodomestico/trabajodomestico.router');
const apiContratacionRouter = require('./misderechos/contratacion/contratacion.router');
const apiJornadaRouter = require('./misderechos/jornada/jornada.router');
const apiSalario = require('./misderechos/salario/salario.router');
const apiSeguridad = require('./misderechos/seguridad/seguridad.router');
const apiBeneficios = require('./misderechos/beneficios/beneficios.router');
const apiEnfermedades = require('./misderechos/enfermedades/enfermedades.router');
const apiLicencias = require('./misderechos/licencias/licencias.router');
const apiEmpleador = require('./empleador/empleador.router');
const apiCustomers = require('./customers/customers.router');
const apiCalculadora = require('./calculadora/calculadora.router');

router.use('/health', apiHealthRouter);
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
router.use('/calculadora', apiCalculadora);

module.exports = router;
