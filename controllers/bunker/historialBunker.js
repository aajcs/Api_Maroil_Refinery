const { response, request } = require("express");
const HistorialBunker = require("../../models/bunker/historialBunker");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idBunker", select: "nombre" },
  { path: "idRefinacion", select: "operador" },
];

// Obtener todas las historialBunkeres con paginación y población de referencias
const historialBunkerGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, historialBunkers] = await Promise.all([
      HistorialBunker.countDocuments(query), // Contar documentos
      HistorialBunker.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (historialBunkers.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron historialBunkers con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, historialBunkers });
  } catch (err) {
    console.error("Error en historialBunkerGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las historialBunkeres.",
    });
  }
};

// Obtener una refinación específica por ID
const historialBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const historialBunker = await HistorialBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!historialBunker) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(historialBunker);
  } catch (err) {
    console.error("Error en historialBunkerGet:", err);

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
const historialBunkerPost = async (req = request, res = response) => {
  const { idBunker, idRefinacion, operador, fecha, incidencias, comentarios } =
    req.body;

  try {
    const nuevaHistorialBunker = new HistorialBunker({
      idBunker,
      idRefinacion,
      operador,
      fecha,
      incidencias,
      comentarios,
    });

    await nuevaHistorialBunker.save();

    // Poblar referencias después de guardar
    await nuevaHistorialBunker.populate(populateOptions);

    res.status(201).json(nuevaHistorialBunker);
  } catch (err) {
    console.error("Error en historialBunkerPost:", err);

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
const historialBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const historialBunkerActualizada = await HistorialBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!historialBunkerActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(historialBunkerActualizada);
  } catch (err) {
    console.error("Error en historialBunkerPut:", err);

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
const historialBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const historialBunker = await HistorialBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!historialBunker) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(historialBunker);
  } catch (err) {
    console.error("Error en historialBunkerDelete:", err);

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
const historialBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - historialBunkerPatch",
  });
};

module.exports = {
  historialBunkerGets,
  historialBunkerGet,
  historialBunkerPost,
  historialBunkerPut,
  historialBunkerDelete,
  historialBunkerPatch,
};
