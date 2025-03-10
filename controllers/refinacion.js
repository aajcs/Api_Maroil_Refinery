const { response, request } = require("express");
const Refinacion = require("../models/refinacion");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idTorre", select: "nombre" },
  { path: "idChequeoCalidad", select: "nombre" },
  { path: "idChequeoCantidad", select: "nombre" },
  { path: "idRefineria", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idProducto", select: "nombre" },
  { path: "derivado.idProducto", select: "nombre" },
  { path: "idChequeoCalidad", select: "operador" },
  { path: "idChequeoCantidad", select: "operador" },
];

// Obtener todas las refinaciones con paginación y población de referencias
const refinacionGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, refinacions] = await Promise.all([
      Refinacion.countDocuments(query), // Contar documentos
      Refinacion.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (refinacions.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron refinacions con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, refinacions });
  } catch (err) {
    console.error("Error en refinacionGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las refinaciones.",
    });
  }
};

// Obtener una refinación específica por ID
const refinacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!refinacion) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacion);
  } catch (err) {
    console.error("Error en refinacionGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la refinación.",
    });
  }
};

// Crear una nueva refinación
const refinacionPost = async (req = request, res = response) => {
  const {
    idTorre,
    idChequeoCalidad,
    idChequeoCantidad,
    idProducto,
    cantidadTotal,
    idRefineria,
    historialOperaciones,
    derivado,
    idTanque,
    fechaInicio,
    fechaFin,
    operador,
  } = req.body;

  try {
    const nuevaRefinacion = new Refinacion({
      idTorre,
      idChequeoCalidad,
      idChequeoCantidad,
      idProducto,
      cantidadTotal,
      idRefineria,
      historialOperaciones,
      derivado,
      idTanque,
      fechaInicio,
      fechaFin,
      operador,
    });

    await nuevaRefinacion.save();

    // Poblar referencias después de guardar
    await nuevaRefinacion.populate(populateOptions);

    res.status(201).json(nuevaRefinacion);
  } catch (err) {
    console.error("Error en refinacionPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de refinación no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la refinación.",
    });
  }
};

// Actualizar una refinación existente
const refinacionPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const refinacionActualizada = await Refinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!refinacionActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacionActualizada);
  } catch (err) {
    console.error("Error en refinacionPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la refinación.",
    });
  }
};

// Eliminar (marcar como eliminado) una refinación
const refinacionDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!refinacion) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacion);
  } catch (err) {
    console.error("Error en refinacionDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la refinación.",
    });
  }
};

// Parchear una refinación (ejemplo básico)
const refinacionPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refinacionPatch",
  });
};

module.exports = {
  refinacionGets,
  refinacionGet,
  refinacionPost,
  refinacionPut,
  refinacionDelete,
  refinacionPatch,
};
