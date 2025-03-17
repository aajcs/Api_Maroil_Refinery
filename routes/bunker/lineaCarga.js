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
  existeLineaPorId,
} = require("../helpers/db-validators");
const {
  lineaCargaGets,
  lineaCargaGet,
  lineaCargaPut,
  lineaCargaPost,
  lineaCargaDelete,
} = require("../../controllers/bunker/lineaCarga");

const router = Router();

router.get("/", lineaCargaGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  lineaCargaGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeLineaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  lineaCargaPut
);

router.post(
  "/",
  [
    // check("numero", "El numero es obligatorio").not().isEmpty(),
    //check("nit").custom(nitExiste),
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("refineria").custom(existeLineaPorId),

    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  lineaCargaPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeLineaPorId),
    validarCampos,
  ],
  lineaCargaDelete
);

router.patch("/", lineaCargaPatch);

module.exports = router;
