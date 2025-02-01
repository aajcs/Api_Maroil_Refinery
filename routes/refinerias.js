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
  emailExiste,
  existeUsuarioPorId,
  nitExiste,
  existeRefineriaPorId,
} = require("../helpers/db-validators");

const {
  refineriasGet,
  refineriasPut,
  refineriasPost,
  refineriasDelete,
  refineriasPatch,
  refineriasGets,
} = require("../controllers/refinerias");

const router = Router();

router.get("/", refineriasGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  refineriasGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRefineriaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  refineriasPut
);

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("nit").custom(nitExiste),
    check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  refineriasPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRefineriaPorId),
    validarCampos,
  ],
  refineriasDelete
);

router.patch("/", refineriasPatch);

module.exports = router;
