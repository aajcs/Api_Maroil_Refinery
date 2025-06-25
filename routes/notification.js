const { Router } = require("express");
const {
  notificationsGets,
  notificationsGet,
  notificationsPost,
  notificationsPut,
  notificationsDelete,
  notificationsByUser,
} = require("../controllers/notification");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

// Obtener todas las notificaciones
router.get("/", [validarJWT], notificationsGets);

// Obtener una notificación específica por ID
router.get("/:id", [validarJWT], notificationsGet);

// Crear una nueva notificación
router.post("/", [validarJWT, validarCampos], notificationsPost);

// Actualizar una notificación existente
router.put("/:id", [validarJWT, validarCampos], notificationsPut);

// Eliminar una notificación
router.delete("/:id", [validarJWT], notificationsDelete);

// Obtener notificaciones por userId
router.get("/user/:userId", [validarJWT], notificationsByUser);

module.exports = router;
