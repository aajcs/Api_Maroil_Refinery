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
  existeChequeoCalidadPorId,
} = require("../helpers/db-validators");
const {
  chequeoCalidadGets,
  chequeoCalidadGet,
  chequeoCalidadPut,
  chequeoCalidadPost,
  chequeoCalidadDelete,
} = require("../../controllers/bunker/chequeoCalidad");

const router = Router();

router.get("/", chequeoCalidadGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeChequeoCalidadPorId ),
    validarCampos,
  ],
  chequeoCalidadGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCalidadPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  chequeoCalidadPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del chequeoCalidad es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del chequeoCalidad es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del chequeoCalidad es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  chequeoCalidadPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeChequeoCalidadPorId),
    validarCampos,
  ],
  chequeoCalidadDelete
);

router.patch("/", chequeoCalidadPatch);

module.exports = router;
