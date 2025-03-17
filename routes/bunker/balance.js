const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const { existeBalancePorId } = require("../helpers/db-validators");
const {
  balanceGets,
  balancePut,
  balancePost,
  balanceDelete,
  balancePatch,
} = require("../../controllers/bunker/balance");
// const { existeRefineriaPorId } = require("../helpers/db-validators");
// const { existeTorrePorId } = require("../helpers/db-validators");
// const { existeTanquePorId } = require("../helpers/db-validators");

const router = Router();

router.get("/", balanceGets);
router.get(
  "/:id",
  [check("id", "No es un id de Mongo válido").isMongoId(), validarCampos],
  balanceGets
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBalancePorId),
    // check("idRefineria").custom(existeRefineriaPorId),
    // check("idTanque").custom(existeTanquePorId),
    // check("idTorre").custom(existeTorrePorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  balancePut
);

router.post(
  "/",
  [
    // // check("idRefineria").custom(existeRefineriaPorId),
    // // check("idTanque").custom(existeTanquePorId),
    // // check("idTorre").custom(existeTorrePorId),
    validarCampos,
  ],
  balancePost
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
  balanceDelete
);

router.patch("/", balancePatch);

module.exports = router;
