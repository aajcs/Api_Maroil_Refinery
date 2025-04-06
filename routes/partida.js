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
  existePartidaPorId,
} = require("../helpers/db-validators");

const {
  partidaGet,
  partidaPut,
  partidaPost,
  partidaDelete,
  partidaPatch,
  partidaGets,
} = require("../controllers/partida");

const router = Router();

router.get("/", partidaGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existePartidaPorId ),
    validarCampos,
  ],
  partidaGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existePartidaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  partidaPut
);

router.post(
  "/",
  [
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre delpartida es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad delpartida es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material delpartida es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  partidaPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existePartidaPorId),
    validarCampos,
  ],
  partidaDelete
);

router.patch("/", partidaPatch);

module.exports = router;
