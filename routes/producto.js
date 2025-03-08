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
  existeProductoPorId,
} = require("../helpers/db-validators");

const {
  productoGet,
  productoPut,
  productoPost,
  productoDelete,
  productoPatch,
  productoGets,
} = require("../controllers/producto");

const router = Router();

router.get("/", productoGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  productoGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeProductoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  productoPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del producto es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del producto es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del producto es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  productoPost
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
  productoDelete
);

router.patch("/", productoPatch);

module.exports = router;
