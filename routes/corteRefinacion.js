const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const { existeCorteRefinacionPorId } = require("../helpers/db-validators");
// const { existeRefineriaPorId } = require("../helpers/db-validators");
// const { existeTorrePorId } = require("../helpers/db-validators");
// const { existeTanquePorId } = require("../helpers/db-validators");
const {
  corteRefinacionGet,
  corteRefinacionPut,
  corteRefinacionPost,
  corteRefinacionDelete,
  corteRefinacionPatch,
  corteRefinacionGets,
  corteRefinacionByRefineria,
} = require("../controllers/corteRefinacion");

const router = Router();

router.get("/", [validarJWT], corteRefinacionGets);

// Obtener cortes de refinación por refinería
router.get(
  "/refineria/:idRefineria",
  [
    validarJWT,
    check("idRefineria", "No es un ID de Mongo válido").isMongoId(),
    validarCampos,
  ],
  corteRefinacionByRefineria
);

router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  corteRefinacionGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeCorteRefinacionPorId),
    // check("idRefineria").custom(existeRefineriaPorId),
    // check("idTanque").custom(existeTanquePorId),
    // check("idTorre").custom(existeTorrePorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  corteRefinacionPut
);

router.post(
  "/",
  [
    validarJWT,
    // // check("idRefineria").custom(existeRefineriaPorId),
    // // check("idTanque").custom(existeTanquePorId),
    // // check("idTorre").custom(existeTorrePorId),
    validarCampos,
  ],
  corteRefinacionPost
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
  corteRefinacionDelete
);

router.patch("/", corteRefinacionPatch);

module.exports = router;
