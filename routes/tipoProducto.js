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
  existeTipoProductoPorId,
} = require("../helpers/db-validators");

const {
  tipoProductoGet,
  tipoProductoPut,
  tipoProductoPost,
  tipoProductoDelete,
  tipoProductoPatch,
  tipoProductoGets,
} = require("../controllers/tipoProducto");

const router = Router();

router.get("/", tipoProductoGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeTipoProductoPorId ),
    validarCampos,
  ],
  tipoProductoGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTipoProductoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  tipoProductoPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del tipoProducto es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del tipoProducto es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del tipoProducto es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  tipoProductoPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTipoProductoPorId),
    validarCampos,
  ],
  tipoProductoDelete
);

router.patch("/", tipoProductoPatch);

module.exports = router;
