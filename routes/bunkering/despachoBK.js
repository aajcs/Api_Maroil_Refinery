const { Router } = require("express");
const {
  despachoBKGets,
  despachoBKGet,
  despachoBKPost,
  despachoBKPut,
  despachoBKDelete,
} = require("../../controllers/bunkering/despachoBK");

const router = Router();

// Obtener todas las recepciones
router.get("/", despachoBKGets);

// Obtener una despacho por ID
router.get("/:id", despachoBKGet);

// Crear una nueva despacho
router.post("/", despachoBKPost);

// Actualizar una despacho existente
router.put("/:id", despachoBKPut);

// Eliminar (marcar como eliminada) una despacho
router.delete("/:id", despachoBKDelete);

module.exports = router;