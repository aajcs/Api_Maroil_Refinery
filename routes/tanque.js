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
} = require("../controllers/tanque");

const router = Router();

router.get("/", tanqueGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  tanqueGet
);
router.put(
  "/:id",
  [
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
    //check("numero", "El numero es obligatorio").not().isEmpty(),
    //check("nit").custom(nitExiste),
    check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("refineria").custom(existeTanquePorId),

    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  tanquePost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("ADMIN_ROLE", "VENTAR_ROLE", "OTRO_ROLE"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTanquePorId),
    validarCampos,
  ],
  tanqueDelete
);

router.patch("/", tanquePatch);

module.exports = router;
