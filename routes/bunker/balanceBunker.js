const { Router } = require("express");
const { check } = require("express-validator");

// const {validarCampos, validarJWT, esAdminRole, tieneRole,} = require("../middlewares");

const { existebalanceBunkerPorId } = require("../../helpers/db-validators");
const { balanceBunkerGets, balanceBunkerPut, balanceBunkerPost, balanceBunkerDelete, balanceBunkerPatch } = require("../../controllers/bunker/balanceBunker");
const { validarCampos, validarJWT, tieneRole, esAdminRole } = require("../../middlewares");

// const { existeRefineriaPorId } = require("../helpers/db-validators");
// const { existeTorrePorId } = require("../helpers/db-validators");
// const { existeTanquePorId } = require("../helpers/db-validators");

const router = Router();

router.get("/", balanceBunkerGets);
router.get(
  "/:id",
  [check("id", "No es un id de Mongo válido").isMongoId(), validarCampos],
  balanceBunkerGets
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existebalanceBunkerPorId),
    // check("idRefineria").custom(existeRefineriaPorId),
    // check("idTanque").custom(existeTanquePorId),
    // check("idTorre").custom(existeTorrePorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  balanceBunkerPut
);

router.post(
  "/",
  [
    // // check("idRefineria").custom(existeRefineriaPorId),
    // // check("idTanque").custom(existeTanquePorId),
    // // check("idTorre").custom(existeTorrePorId),
    validarCampos,
  ],
  balanceBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    // check("idRefineria").custom(existeRefineriaPorId),
    // check("idTanque").custom(existeTanquePorId),
    // check("idTorre").custom(existeTorrePorId),
    validarCampos,
  ],
  balanceBunkerDelete
);

router.patch("/", balanceBunkerPatch);

module.exports = router;
