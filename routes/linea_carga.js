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
  linea_cargaGet,
  linea_cargaPut,
  linea_cargaPost,
  linea_cargaDelete,
  linea_cargaPatch,
  linea_cargaGets,
} = require("../controllers/linea_carga");

const router = Router();

router.get("/", linea_cargaGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  linea_cargaGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeLineaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  linea_cargaPut
);

router.post(
  "/",
  [
    check("numero", "El numero es obligatorio").not().isEmpty(),
    //check("nit").custom(nitExiste),
    check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("refineria").custom(existeLineaPorId),

    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  linea_cargaPost
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
  linea_cargaDelete
);

router.patch("/", linea_cargaPatch);

module.exports = router;
