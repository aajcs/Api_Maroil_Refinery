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
  existeFacturaPorId,
} = require("../helpers/db-validators");

const {
  facturaGet,
  facturaPut,
  facturaPost,
  facturaDelete,
  facturaPatch,
  facturaGets,
} = require("../controllers/factura");

const router = Router();

router.get(
  "/",
  validarJWT,

  facturaGets
);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeFacturaPorId ),
    validarCampos,
  ],
  facturaGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeFacturaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  facturaPut
);

router.post(
  "/",
  [
    validarJWT,
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre delfactura es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad delfactura es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material delfactura es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  facturaPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeFacturaPorId),
    validarCampos,
  ],
  facturaDelete
);

router.patch("/", facturaPatch);

module.exports = router;
