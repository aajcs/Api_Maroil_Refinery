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
  existeChequeoCantidadBunkerPorId,
} = require("../../helpers/db-validators");
const {
  chequeoCantidadBunkerGet,
  chequeoCantidadBunkerGets,
  chequeoCantidadBunkerPut,
  chequeoCantidadBunkerPost,
  chequeoCantidadBunkerDelete,
  chequeoCantidadBunkerPatch,
} = require("../../controllers/bunker/chequeoCantidadBunker");

const router = Router();

router.get("/", chequeoCantidadBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeChequeoCantidadBunkerPorId ),
    validarCampos,
  ],
  chequeoCantidadBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCantidadBunkerPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  chequeoCantidadBunkerPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del chequeoCantidadBunker es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del chequeoCantidadBunker es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del chequeoCantidadBunker es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  chequeoCantidadBunkerPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCantidadBunkerPorId),
    validarCampos,
  ],
  chequeoCantidadBunkerDelete
);

router.patch("/", chequeoCantidadBunkerPatch);

module.exports = router;
