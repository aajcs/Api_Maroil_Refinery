const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarJWT, tieneRole } = require("../middlewares");

const { existeBalancePorId } = require("../helpers/db-validators");

const {
  balanceGet,
  balancePut,
  balancePost,
  balanceDelete,
  balancePatch,
  balanceGets,
} = require("../controllers/balance");

const router = Router();

router.get("/", [validarJWT], balanceGets);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  balanceGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBalancePorId),
    validarCampos,
  ],
  balancePut
);

router.post("/", [validarJWT, validarCampos], balancePost);

router.delete(
  "/:id",
  [
    validarJWT,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBalancePorId),
    validarCampos,
  ],
  balanceDelete
);

router.patch("/", [validarJWT], balancePatch);

module.exports = router;
