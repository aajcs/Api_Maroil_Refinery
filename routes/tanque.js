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
  existeTanquePorId,
} = require("../helpers/db-validators");

const {
  tanqueGet,
  tanquePut,
  tanquePost,
  tanqueDelete,
  tanquePatch,
  tanqueGets,
  tanquesByRefineria,
} = require("../controllers/tanque");

const router = Router();

router.get("/", [validarJWT], tanqueGets);

// Obtener tanques por refinería
router.get(
  "/refineria/:idRefineria",
  [
    validarJWT,
    check("idRefineria", "No es un ID de Mongo válido").isMongoId(),
    validarCampos,
  ],
  tanquesByRefineria
);

// Obtener un tanque específico por ID
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  tanqueGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTanquePorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  tanquePut
);

router.post(
  "/",
  [
    validarJWT,
    //Validación de campos.

    check("nombre", "El nombre del tanque es obligatorio").not().isEmpty(),
    check("capacidad", "La capacidad del tanque es obligatoria")
      .not()
      .isEmpty(),
    validarCampos,
  ],
  tanquePost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTanquePorId),
    validarCampos,
  ],
  tanqueDelete
);

router.patch("/", tanquePatch);

module.exports = router;
