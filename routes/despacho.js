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
  existeDespachoPorId,
} = require("../helpers/db-validators");

const {
  despachoGet,
  despachoPut,
  despachoPost,
  despachoDelete,
  despachoPatch,
  despachoGets,
} = require("../controllers/despacho");

const router = Router();

router.get("/", [validarJWT], despachoGets);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  despachoGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeDespachoPorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  despachoPut
);

router.post(
  "/",
  [
    validarJWT,
    // check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("nombre", "El nombre del tanque es obligatorio").not().isEmpty(),
    // check("nit", "El NIT es obligatorio").not().isEmpty(),
    // check("img", "El logotipo de la refineria es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  despachoPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeDespachoPorId),
    validarCampos,
  ],
  despachoDelete
);

router.patch("/", despachoPatch);

module.exports = router;
