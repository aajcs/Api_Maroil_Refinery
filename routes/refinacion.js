const express = require("express");
const {
  crearRefinacion,
  obtenerRefinaciones,
  obtenerRefinacionPorId,
  actualizarRefinacion,
  eliminarRefinacion,
} = require("../controllers/refinacion");

const router = express.Router();

// Ruta para crear un nuevo proceso de refinación
router.post("/refinaciones", crearRefinacion);

// Ruta para obtener todos los procesos de refinación
router.get("/refinaciones", obtenerRefinaciones);

// Ruta para obtener un proceso de refinación por su ID
router.get("/refinaciones/:id", obtenerRefinacionPorId);

// Ruta para actualizar un proceso de refinación por su ID
router.put("/refinaciones/:id", actualizarRefinacion);

// Ruta para eliminar un proceso de refinación por su ID
router.delete("/refinaciones/:id", eliminarRefinacion);

module.exports = router;