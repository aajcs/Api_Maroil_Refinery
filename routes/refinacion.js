const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const {
  
  existeRefinacionPorId,
} = require("../helpers/db-validators");

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
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  refinacionGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRefinacionPorId),
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
    check("id").custom(existeRefinacionPorId),
    validarCampos,
  ],
  refinacionDelete
);

router.patch("/", refinacionPatch);

module.exports = router;
