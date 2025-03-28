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
  existeGastoPorId,
} = require("../helpers/db-validators");

const {
  gastoGet,
  gastoPut,
  gastoPost,
  gastoDelete,
  gastoPatch,
  gastoGets,
} = require("../controllers/gasto");

const router = Router();

router.get("/", gastoGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeGastoPorId ),
    validarCampos,
  ],
  gastoGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeGastoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  gastoPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre delgasto es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad delgasto es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material delgasto es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  gastoPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeGastoPorId),
    validarCampos,
  ],
  gastoDelete
);

router.patch("/", gastoPatch);

module.exports = router;
