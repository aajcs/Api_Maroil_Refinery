const { response, request } = require("express");
const Historial = require("../models/historial");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idBunker", select: "nombre" },
  { path: "idRefinacion", select: "operador" },
];

// Obtener todas las historiales con paginación y población de referencias
const historialGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, historials] = await Promise.all([
      Historial.countDocuments(query), // Contar documentos
      Historial.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (historials.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron historials con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, historials });
  } catch (err) {
    console.error("Error en historialGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las historiales.",
    });
  }
};

// Obtener una refinación específica por ID
const historialGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const historial = await Historial.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!historial) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(historial);
  } catch (err) {
    console.error("Error en historialGet:", err);

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
const historialPost = async (req = request, res = response) => {
  const { idBunker, idRefinacion, operador, fecha, incidencias, comentarios } =
    req.body;

  try {
    const nuevaHistorial = new Historial({
      idBunker,
      idRefinacion,
      operador,
      fecha,
      incidencias,
      comentarios,
    });

    await nuevaHistorial.save();

    // Poblar referencias después de guardar
    await nuevaHistorial.populate(populateOptions);

    res.status(201).json(nuevaHistorial);
  } catch (err) {
    console.error("Error en historialPost:", err);

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
const historialPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const historialActualizada = await Historial.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!historialActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(historialActualizada);
  } catch (err) {
    console.error("Error en historialPut:", err);

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
const historialDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const historial = await Historial.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!historial) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(historial);
  } catch (err) {
    console.error("Error en historialDelete:", err);

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
const historialPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - historialPatch",
  });
};

module.exports = {
  historialGets,
  historialGet,
  historialPost,
  historialPut,
  historialDelete,
  historialPatch,
};
