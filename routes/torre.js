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
  existeTorrePorId,
} = require("../helpers/db-validators");

const {
  torreGet,
  torrePut,
  torrePost,
  torreDelete,
  torrePatch,
  torreGets,
} = require("../controllers/torre");

const router = Router();

router.get("/", torreGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  torreGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTorrePorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  torrePut
);

router.post(
  "/",
  [
    //check("numero", "El numero es obligatorio").not().isEmpty(),
    //check("nit").custom(nitExiste),
    // check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("refineria").custom(existeTorrePorId),

    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  torrePost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTorrePorId),
    validarCampos,
  ],
  torreDelete
);

router.patch("/", torrePatch);

module.exports = router;
