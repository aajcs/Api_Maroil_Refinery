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
  existeHistorialBunkerPorId,
} = require("../../helpers/db-validators");
const {
  historialBunkerGet,
  historialBunkerPut,
  historialBunkerPost,
  historialBunkerDelete,
  historialBunkerPatch,
  historialBunkerGets,
} = require("../../controllers/bunker/historialBunker");

const router = Router();

router.get("/", historialBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeHistorialBunkerPorId ),
    validarCampos,
  ],
  historialBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeHistorialBunkerPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  historialBunkerPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre delhistorialBunker es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad delhistorialBunker es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material delhistorialBunker es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  historialBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeHistorialBunkerPorId),
    validarCampos,
  ],
  historialBunkerDelete
);

router.patch("/", historialBunkerPatch);

module.exports = router;
