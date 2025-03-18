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
  existeContactoBunkerPorId,
} = require("../../helpers/db-validators");
const {
  contactoBunkerGets,
  contactoBunkerGet,
  contactoBunkerPut,
  contactoBunkerPost,
  contactoBunkerDelete,
} = require("../../controllers/bunker/contactoBunker");
const { contactoBunkerPatch } = require("../../controllers/bunker/contactoBunker");

const router = Router();

router.get("/", contactoBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  contactoBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeContactoBunkerPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  contactoBunkerPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del contactoBunker es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del contactoBunker es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del contactoBunker es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  contactoBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeContactoBunkerPorId),
    validarCampos,
  ],
  contactoBunkerDelete
);

router.patch("/", contactoBunkerPatch);

module.exports = router;
