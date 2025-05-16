const { Router } = require("express");
const {
  recepcionBKGets,
  recepcionBKGet,
  recepcionBKPost,
  recepcionBKPut,
  recepcionBKDelete,
} = require("../../controllers/bunkering/recepcionBK");
const { validarJWT } = require("../../middlewares");

const router = Router();

// Obtener todas las recepciones
router.get("/", validarJWT, recepcionBKGets);

// Obtener una recepción por ID
router.get("/:id", validarJWT, recepcionBKGet);

// Crear una nueva recepción
router.post("/", validarJWT, recepcionBKPost);

// Actualizar una recepción existente
router.put("/:id", validarJWT, recepcionBKPut);

// Eliminar (marcar como eliminada) una recepción
router.delete("/:id", validarJWT, recepcionBKDelete);

module.exports = router;
