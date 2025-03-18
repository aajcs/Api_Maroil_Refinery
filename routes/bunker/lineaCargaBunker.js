const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../../middlewares");

const {
  //esRoleValido,
  // emailExiste,
  // existeUsuarioPorId,
  // nitExiste,
  existeLineaPorId,
} = require("../../helpers/db-validators");
const {
  lineaCargaBunkerGets,
  lineaCargaBunkerGet,
  lineaCargaBunkerPut,
  lineaCargaBunkerPost,
  lineaCargaBunkerDelete,
} = require("../../controllers/bunker/lineaCargaBunker");
const { lineaCargaBunkerPatch } = require("../../controllers/bunker/lineaCargaBunker");

const router = Router();

router.get("/", lineaCargaBunkerGets);
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  lineaCargaBunkerGet
);
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeLineaPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  lineaCargaBunkerPut
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
  lineaCargaBunkerPost
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
  lineaCargaBunkerDelete
);

router.patch("/", lineaCargaBunkerPatch);

module.exports = router;
