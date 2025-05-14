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
  existeContratoPorId,
  existeChequeoCantidadPorId,
} = require("../helpers/db-validators");

const {
  chequeoCantidadGet,
  chequeoCantidadPut,
  chequeoCantidadPost,
  chequeoCantidadDelete,
  chequeoCantidadPatch,
  chequeoCantidadGets,
} = require("../controllers/chequeoCantidad");

const router = Router();

router.get("/", [validarJWT], chequeoCantidadGets);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeChequeoCantidadPorId ),
    validarCampos,
  ],
  chequeoCantidadGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCantidadPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  chequeoCantidadPut
);

router.post(
  "/",
  [
    validarJWT,
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del chequeoCantidad es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del chequeoCantidad es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del chequeoCantidad es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  chequeoCantidadPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCantidadPorId),
    validarCampos,
  ],
  chequeoCantidadDelete
);

router.patch("/", chequeoCantidadPatch);

module.exports = router;
