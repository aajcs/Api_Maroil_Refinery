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
  existeContratoBunkerPorId,
} = require("../../helpers/db-validators");
const {
  contratoBunkerGet,
  contratoBunkerPut,
  contratoBunkerPost,
  contratoBunkerDelete,
  contratoBunkerGets,
  contratoBunkerPatch,
} = require("../../controllers/bunker/contratoBunker");

const router = Router();

router.get("/", contratoBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  contratoBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeContratoBunkerPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  contratoBunkerPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del contratoBunker es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del contratoBunker es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del contratoBunker es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  contratoBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeContratoBunkerPorId),
    validarCampos,
  ],
  contratoBunkerDelete
);

router.patch("/", contratoBunkerPatch);

module.exports = router;
