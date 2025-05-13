const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const { existeSubPartidaPorId } = require("../helpers/db-validators");

const {
  subPartidaGet,
  subPartidaPut,
  subPartidaPost,
  subPartidaDelete,
  subPartidaPatch,
  subPartidaGets,
} = require("../controllers/subPartida");

const router = Router();

router.get("/", subPartidaGets);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existePartidaPorId ),
    validarCampos,
  ],
  subPartidaGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeSubPartidaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  subPartidaPut
);

router.post(
  "/",
  [
    validarJWT,
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre delsubPartida es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad delsubPartida es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material delsubPartida es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  subPartidaPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeSubPartidaPorId),
    validarCampos,
  ],
  subPartidaDelete
);

router.patch("/", subPartidaPatch);

module.exports = router;
