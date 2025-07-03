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
  existeAbonoPorId,
} = require("../helpers/db-validators");

const {
  abonoGet,
  abonoPut,
  abonoPost,
  abonoDelete,
  abonoPatch,
  abonoGets,
  sumarAbonosPorTipoYFecha,
} = require("../controllers/abono");

const router = Router();

router.get("/sumar", sumarAbonosPorTipoYFecha); // <-- agrega la ruta

router.get("/", [validarJWT], abonoGets);
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    // check('id').custom( existeProductoPorId ),
    validarCampos,
  ],
  abonoGet
);
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeAbonoPorId),
    //check("rol").custom(esRoleValido),
    validarCampos,
  ],
  abonoPut
);

router.post(
  "/",
  [
    validarJWT,
    //Validación de campos.
    //check("ubicacion", "La ubicación es obligatorio").not().isEmpty(),
    //check("nombre", "El nombre del abono es obligatorio").not().isEmpty(),
    //check("capacidad", "La capacidad del abono es obligatoria")
    //  .not()
    //.isEmpty(),
    // check("material", "El material del abono es obligatoria").not().isEmpty(),
    // validarCampos,
  ],
  abonoPost
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeAbonoPorId),
    validarCampos,
  ],
  abonoDelete
);

router.patch("/", abonoPatch);




module.exports = router;
