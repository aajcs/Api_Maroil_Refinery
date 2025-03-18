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
  existeContratoPorId,
  existeChequeoCalidadBunkerPorId,
} = require("../../helpers/db-validators");
const {
  chequeoCalidadBunkerGets,
  chequeoCalidadBunkerGet,
  chequeoCalidadBunkerPut,
  chequeoCalidadBunkerPost,
  chequeoCalidadBunkerDelete,
} = require("../../controllers/bunker/chequeoCalidadBunker");
const { chequeoCalidadBunkerPatch } = require("../../controllers/bunker/chequeoCalidadBunker");

const router = Router();

router.get("/", chequeoCalidadBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeChequeoCalidadBunkerPorId ),
    validarCampos,
  ],
  chequeoCalidadBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCalidadBunkerPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  chequeoCalidadBunkerPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del chequeoCalidadBunker es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del chequeoCalidadBunker es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del chequeoCalidadBunker es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  chequeoCalidadBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCalidadBunkerPorId),
    validarCampos,
  ],
  chequeoCalidadBunkerDelete
);

router.patch("/", chequeoCalidadBunkerPatch);

module.exports = router;
