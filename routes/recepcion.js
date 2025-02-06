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
  // emailExiste,
  // existeUsuarioPorId,
  // nitExiste,
  existeRecepcionPorId,
} = require("../helpers/db-validators");

const {
  recepcionGet,
  recepcionPut,
  recepcionPost,
  recepcionDelete,
  recepcionPatch,
  recepcionGets,
} = require("../controllers/recepcion");

const router = Router();

router.get("/", recepcionGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  recepcionGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRecepcionPorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  recepcionPut
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
  recepcionPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRecepcionPorId),
    validarCampos,
  ],
  recepcionDelete
);

router.patch("/", recepcionPatch);

module.exports = router;
