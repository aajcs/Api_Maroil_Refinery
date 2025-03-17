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
  existeBarcazaPorId,
} = require("../helpers/db-validators");
const {
  barcazaGet,
  barcazaGets,
  barcazaPut,
  barcazaPost,
  barcazaDelete,
} = require("../../controllers/bunker/barcaza");

const router = Router();

router.get("/", barcazaGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  barcazaGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBarcazaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  barcazaPut
);

router.post(
  "/",
  [
    //Validación de campos.

    check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    check("nombre", "El nombre delbarcaza es obligatorio").not().isEmpty(),
    check("capacidad", "La capacidad delbarcaza es obligatoria")
      .not()
      .isEmpty(),
    check("material", "El material delbarcaza es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  barcazaPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBarcazaPorId),
    validarCampos,
  ],
  barcazaDelete
);

router.patch("/", barcazaPatch);

module.exports = router;
