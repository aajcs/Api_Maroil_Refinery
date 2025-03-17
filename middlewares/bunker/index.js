

const validaCampos = require('../middlewares/bunker/validar-campos');
const validarJWT   = require('../middlewares/bunker/validar-jwt');
const validaRoles  = require('../middlewares/bunker/validar-roles');
const validarArchivo = require('../middlewares/bunker/validar-archivo');

module.exports = {
    ...validaCampos,
    ...validarJWT,
    ...validaRoles,
    ...validarArchivo
}