const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  tieneRole,
} = require("../middlewares");

const {
  existeContratoPorId,
} = require("../helpers/db-validators");

const {
  cuentaGets,
  cuentaGet,
  cuentaPostFromContrato,
  cuentaPut,
  cuentaDelete,
  cuentaSyncFromContrato,
} = require("../controllers/cuenta");

const router = Router();

// Obtener todas las cuentas
router.get("/", cuentaGets);

// Obtener una cuenta específica por ID
router.get(
  "/:id",
  [
    check("id", "No es un ID de Mongo válido").isMongoId(),
    validarCampos,
  ],
  cuentaGet
);

// Crear una nueva cuenta desde un contrato
router.post(
  "/from-contrato",
  [
    check("idContrato", "El ID del contrato es obligatorio").not().isEmpty(),
    check("idContrato", "No es un ID de Mongo válido").isMongoId(),
    check("idContrato").custom(existeContratoPorId),
    validarCampos,
  ],
  cuentaPostFromContrato
);

// Actualizar una cuenta por ID
router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("contrato", "El ID del contrato debe ser válido").optional().isMongoId(),
    check("tipoCuenta", "El tipo de cuenta debe ser 'Cuentas por Cobrar' o 'Cuentas por Pagar'")
      .optional()
      .isIn(["Cuentas por Cobrar", "Cuentas por Pagar"]),
    check("montoTotalContrato", "El monto total debe ser un número positivo").optional().isFloat({ min: 0 }),
    validarCampos,
  ],
  cuentaPut
);

// Eliminar una cuenta por ID
router.delete(
  "/:id",
  [
    validarJWT,
    tieneRole("superAdmin", "admin"),
    check("id", "No es un ID válido").isMongoId(),
    validarCampos,
  ],
  cuentaDelete
);

// Sincronizar una cuenta desde un contrato
router.post(
  "/sync/:contratoId",
  [
    check("contratoId", "No es un ID de Mongo válido").isMongoId(),
    check("contratoId").custom(existeContratoPorId),
    validarCampos,
  ],
  cuentaSyncFromContrato
);

module.exports = router;