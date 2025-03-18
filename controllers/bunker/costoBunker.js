const { response, request } = require("express");
const CostoBunker = require("../../models/bunker/costoBunker");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idBunker", select: "nombre" },
  { path: "idContrato" },
];

// Obtener todas las costoBunkeres con paginación y población de referencias
const costoBunkerGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, costoBunkers] = await Promise.all([
      CostoBunker.countDocuments(query), // Contar documentos
      CostoBunker.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (costoBunkers.length === 0) {
      return res.status(404).json({
        message: "No se encontraron costoBunkers con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, costoBunkers });
  } catch (err) {
    console.error("Error en costoBunkerGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las costoBunkeres.",
    });
  }
};

// Obtener una refinación específica por ID
const costoBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const costoBunker = await CostoBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!costoBunker) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(costoBunker);
  } catch (err) {
    console.error("Error en costoBunkerGet:", err);

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
const costoBunkerPost = async (req = request, res = response) => {
  const { idBunker, idContratoCompra, costoBunkers, costoBunkerTotal } = req.body;

  try {
    const nuevaCostoBunker = new CostoBunker({
      idBunker,
      idContratoCompra,
      costoBunkers,
      costoBunkerTotal,
    });

    await nuevaCostoBunker.save();

    // Poblar referencias después de guardar
    await nuevaCostoBunker.populate(populateOptions);

    res.status(201).json(nuevaCostoBunker);
  } catch (err) {
    console.error("Error en costoBunkerPost:", err);

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
const costoBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const costoBunkerActualizada = await CostoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!costoBunkerActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(costoBunkerActualizada);
  } catch (err) {
    console.error("Error en costoBunkerPut:", err);

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
const costoBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const costoBunker = await CostoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!costoBunker) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(costoBunker);
  } catch (err) {
    console.error("Error en costoBunkerDelete:", err);

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
const costoBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - costoBunkerPatch",
  });
};

module.exports = {
  costoBunkerGets,
  costoBunkerGet,
  costoBunkerPost,
  costoBunkerPut,
  costoBunkerDelete,
  costoBunkerPatch,
};
