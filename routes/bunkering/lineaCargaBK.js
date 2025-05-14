const { Router } = require("express");
const {
  lineaCargaBKGets,
  lineaCargaBKGet,
  lineaCargaBKPost,
  lineaCargaBKPut,
  lineaCargaBKDelete,
} = require("../../controllers/bunkering/lineaCargaBK");

const router = Router();

// Obtener todas las líneas de carga
router.get("/", lineaCargaBKGets);

// Obtener una línea de carga por ID
router.get("/:id", lineaCargaBKGet);

// Crear una nueva línea de carga
router.post("/", lineaCargaBKPost);

// Actualizar una línea de carga existente
router.put("/:id", lineaCargaBKPut);

// Eliminar (marcar como eliminada) una línea de carga
router.delete("/:id", lineaCargaBKDelete);

module.exports = router;