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
  existeRecepcionPorId,
} = require("../helpers/db-validators");

const {
  recepcionGet,
  recepcionPut,
  recepcionPost,
  recepcionDelete,
  recepcionPatch,
  recepcionGets,
  recepcionAgruparPorStatus,
  recepcionPorRangoFechas,
} = require("../controllers/recepcion");

const router = Router();

router.get("/agrupar-status", recepcionAgruparPorStatus);
// Recibe los parámetros de fecha por query string, por ejemplo: /rango-fechas?fechaInicio=2024-01-01&fechaFin=2024-01-31
router.get("/rango-fechas", recepcionPorRangoFechas);

router.get("/", [validarJWT], recepcionGets);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  recepcionGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRecepcionPorId),
    //check("rol").custom(esRoleValido), subiendo cambioos
    validarCampos,
  ],
  recepcionPut
);

router.post(
  "/",
  [
    validarJWT,
    // check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    // check("nombre", "El nombre del tanque es obligatorio").not().isEmpty(),
    // check("nit", "El NIT es obligatorio").not().isEmpty(),
    // check("img", "El logotipo de la refineria es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  recepcionPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeRecepcionPorId),
    validarCampos,
  ],
  recepcionDelete
);

router.patch("/", recepcionPatch);

module.exports = router;
