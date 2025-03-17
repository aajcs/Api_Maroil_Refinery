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
  existeContactoPorId,
} = require("../helpers/db-validators");
const {
  contactoGets,
  contactoGet,
  contactoPut,
  contactoPost,
  contactoDelete,
} = require("../../controllers/bunker/contacto");

const router = Router();

router.get("/", contactoGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  contactoGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeContactoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  contactoPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del contacto es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del contacto es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del contacto es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  contactoPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeContactoPorId),
    validarCampos,
  ],
  contactoDelete
);

router.patch("/", contactoPatch);

module.exports = router;
