const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarJWT, tieneRole } = require("../middlewares");
const { cuentaSaldosPendientes } = require("../controllers/cuenta");
const { cuentaAgruparPorContacto } = require("../controllers/cuenta");

const { existeContratoPorId } = require("../helpers/db-validators");

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
router.get("/", [validarJWT], cuentaGets);

router.get("/saldos", cuentaSaldosPendientes);

//Agrupar cuentas por contacto
router.get("/agrupar", cuentaAgruparPorContacto);


// Obtener una cuenta específica por ID de cuenta
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID de Mongo válido").isMongoId(),
    validarCampos,
  ],
  cuentaGet
);




// Obtener una cuenta específica por ID de contrato
router.get(
  "/contrato/:idContrato",
  [
    validarJWT,
    check("idContrato", "No es un ID de Mongo válido").isMongoId(),
    validarCampos,
  ],
  async (req, res) => {
    const { idContrato } = req.params;
    const Cuenta = require("../models/cuenta");
    try {
      const cuenta = await Cuenta.findOne({ idContrato });
      if (!cuenta) {
        return res
          .status(404)
          .json({ msg: "Cuenta no encontrada para ese contrato" });
      }
      res.json(cuenta);
    } catch (err) {
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
);

// Crear una nueva cuenta desde un contrato
router.post(
  "/from-contrato",
  [
    validarJWT,
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
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("contrato", "El ID del contrato debe ser válido")
      .optional()
      .isMongoId(),
    check(
      "tipoCuenta",
      "El tipo de cuenta debe ser 'Cuentas por Cobrar' o 'Cuentas por Pagar'"
    )
      .optional()
      .isIn(["Cuentas por Cobrar", "Cuentas por Pagar"]),
    check("montoTotalContrato", "El monto total debe ser un número positivo")
      .optional()
      .isFloat({ min: 0 }),
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
    validarJWT,
    check("contratoId", "No es un ID de Mongo válido").isMongoId(),
    check("contratoId").custom(existeContratoPorId),
    validarCampos,
  ],
  cuentaSyncFromContrato
);


module.exports = router;
