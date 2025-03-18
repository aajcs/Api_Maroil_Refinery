const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../../middlewares");

const {
  //esRoleValido,
  // emailExiste,
  // existeUsuarioPorId,
  // nitExiste,
  existeRecepcionBunkerPorId,
} = require("../../helpers/db-validators");
const {
  recepcionBunkerGets,
  recepcionBunkerGet,
  recepcionBunkerPut,
  recepcionBunkerPost,
  recepcionBunkerDelete,
} = require("../../controllers/bunker/recepcionBunker");
const { recepcionBunkerPatch } = require("../../controllers/bunker/recepcionBunker");

const router = Router();

router.get("/", recepcionBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  recepcionBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRecepcionBunkerPorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  recepcionBunkerPut
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
  recepcionBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRecepcionBunkerPorId),
    validarCampos,
  ],
  recepcionBunkerDelete
);

router.patch("/", recepcionBunkerPatch);

module.exports = router;
