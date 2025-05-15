const { Router } = require("express");
const {
  recepcionBKGets,
  recepcionBKGet,
  recepcionBKPost,
  recepcionBKPut,
  recepcionBKDelete,
} = require("../../controllers/bunkering/recepcionBK");

const router = Router();

// Obtener todas las recepciones
router.get("/", recepcionBKGets);

// Obtener una recepción por ID
router.get("/:id", recepcionBKGet);

// Crear una nueva recepción
router.post("/", recepcionBKPost);

// Actualizar una recepción existente
router.put("/:id", recepcionBKPut);

// Eliminar (marcar como eliminada) una recepción
router.delete("/:id", recepcionBKDelete);

module.exports = router;