const { Router } = require('express');
const { check } = require('express-validator');
const {
    getDespachos,
    getDespachoById,
    createDespacho,
    updateDespacho,
    deleteDespacho
} = require('../controllers/despachoController');

const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole,
} = require('../middlewares');

const {
    existeRecepcionPorId,
} = require('../helpers/db-validators');

const router = Router();

router.get("/", getDespachos);

router.get(
    "/:id",
    [
        check("id", "No es un id de Mongo válido").isMongoId(),
        validarCampos,
    ],
    getDespachoById
);

router.post(
    "/",
    [
        // Agregar validaciones específicas aquí si es necesario
        validarCampos,
    ],
    createDespacho
);

router.put(
    "/:id",
    [
        check("id", "No es un ID válido").isMongoId(),
        check("id").custom(existeRecepcionPorId),
        validarCampos,
    ],
    updateDespacho
);

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole("superAdmin", "admin"),
        check("id", "No es un ID válido").isMongoId(),
        check("id").custom(existeRecepcionPorId),
        validarCampos,
    ],
    deleteDespacho
);

module.exports = router;
