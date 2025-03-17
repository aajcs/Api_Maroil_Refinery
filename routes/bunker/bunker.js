const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const {
  //esRoleValido,
  emailExiste,
  existeUsuarioPorId,
  nitExiste,
  existeBunkerPorId,
} = require("../helpers/db-validators");
const {
  bunkersGet,
  bunkersPut,
  bunkersPost,
  bunkersDelete,
  bunkersGets,
} = require("../../controllers/bunker/bunker");

const router = Router();

router.get("/", bunkersGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  bunkersGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBunkerPorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  bunkersPut
);

router.post(
  "/",
  [
    check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    check("nombre", "El nombre del tanque es obligatorio").not().isEmpty(),
    check("nit", "El NIT es obligatorio").not().isEmpty(),
    check("img", "El logotipo de la refineria es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  bunkersPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBunkerPorId),
    validarCampos,
  ],
  bunkersDelete
);

router.patch("/", bunkerPatch);

module.exports = router;
