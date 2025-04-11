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
  existeBalancePorId,
} = require("../helpers/db-validators");

const {
  balanceGet,
  balancePut,
  balancePost,
  balanceDelete,
  balancePatch,
  balanceGets,
} = require("../controllers/balance");

const router = Router();

router.get("/", balanceGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  balanceGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBalancePorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  balancePut
);

router.post(
  "/",
  [
    //check("numero", "El numero es obligatorio").not().isEmpty(),
    //check("nit").custom(nitExiste),
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("refineria").custom(existeBalancePorId),

    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  balancePost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeBalancePorId),
    validarCampos,
  ],
  balanceDelete
);

router.patch("/", balancePatch);

module.exports = router;
