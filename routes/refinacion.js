const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const { existeRefinacionPorId } = require("../helpers/db-validators");
const { existeRefineriaPorId } = require("../helpers/db-validators");
const { existeTorrePorId } = require("../helpers/db-validators");
const { existeTanquePorId } = require("../helpers/db-validators");
const {
  refinacionGet,
  refinacionPut,
  refinacionPost,
  refinacionDelete,
  refinacionPatch,
  refinacionGets,
} = require("../controllers/refinacion");

const router = Router();

router.get("/", refinacionGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  refinacionGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRefinacionPorId),
    // check("idRefineria").custom(existeRefineriaPorId),
    // check("idTanque").custom(existeTanquePorId),
    // check("idTorre").custom(existeTorrePorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  refinacionPut
);

router.post(
  "/",
  [
    // check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("nombre", "El nombre del tanque es obligatorio").not().isEmpty(),
    // check("nit", "El NIT es obligatorio").not().isEmpty(),
    // check("img", "El logotipo de la refineria es obligatorio").not().isEmpty(),
    check("idRefineria").custom(existeRefineriaPorId),
    check("idTanque").custom(existeTanquePorId),
    check("idTorre").custom(existeTorrePorId),
    validarCampos,
  ],
  refinacionPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    // check("idRefineria").custom(existeRefineriaPorId),
    // check("idTanque").custom(existeTanquePorId),
    // check("idTorre").custom(existeTorrePorId),
    validarCampos,
  ],
  refinacionDelete
);

router.patch("/", refinacionPatch);

module.exports = router;
