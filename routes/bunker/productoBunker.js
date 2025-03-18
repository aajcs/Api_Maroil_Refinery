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
  existeProductoPorId,
} = require("../../helpers/db-validators");
const {
  productoBunkerGets,
  productoBunkerGet,
  productoBunkerPut,
  productoBunkerPost,
  productoBunkerDelete,
  productoBunkerPatch,
} = require("../../controllers/bunker/productoBunker");

const router = Router();

router.get("/", productoBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  productoBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeProductoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  productoBunkerPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del productoBunker es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del productoBunker es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del productoBunker es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  productoBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeProductoPorId),
    validarCampos,
  ],
  productoBunkerDelete
);

router.patch("/", productoBunkerPatch);

module.exports = router;
