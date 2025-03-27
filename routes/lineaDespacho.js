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
  existeLineaDespachoPorId,
} = require("../helpers/db-validators");

const {
  lineaDespachoGet,
  lineaDespachoPut,
  lineaDespachoPost,
  lineaDespachoDelete,
  lineaDespachoPatch,
  lineaDespachoGets,
} = require("../controllers/lineaDespacho");

const router = Router();

router.get("/", lineaDespachoGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  lineaDespachoGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeLineaDespachoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  lineaDespachoPut
);

router.post(
  "/",
  [
    // check("numero", "El numero es obligatorio").not().isEmpty(),
    //check("nit").custom(nitExiste),
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("refineria").custom(existeLineaDespachoPorId),

    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  lineaDespachoPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeLineaDespachoPorId),
    validarCampos,
  ],
  lineaDespachoDelete
);

router.patch("/", lineaDespachoPatch);

module.exports = router;
