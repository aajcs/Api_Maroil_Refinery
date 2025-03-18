const { response, request } = require("express");
const BalanceBunker = require("../../models/bunker/balanceBunker");
const { selectFields } = require("express-validator/src/select-fields");
// const { BalanceBunker } = require("../../models");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idBunker", select: "nombre" },
  { path: "venta", select: "montoTotal" },
  { path: "compra", select: "montoTotal" },
];

// Obtener todas las balanceBunkeres con paginación y población de referencias
const balanceBunkerGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, balanceBunkers] = await Promise.all([
      BalanceBunker.countDocuments(query), // Contar documentos
      BalanceBunker.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (balanceBunkers.length === 0) {
      return res.status(404).json({
        message: "No se encontraron balanceBunkers con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, balanceBunkers });
  } catch (err) {
    console.error("Error en balanceBunkerGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las balanceBunkeres.",
    });
  }
};

// Obtener una balanceBunker específica por ID
const balanceBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const balanceBunker = await BalanceBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!balanceBunker) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(balanceBunker);
  } catch (err) {
    console.error("Error en balanceBunkerGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balanceBunker no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la balanceBunker.",
    });
  }
};

// Crear una nueva balanceBunker
const balanceBunkerPost = async (req = request, res = response) => {
  const { idBunker, compra, venta, montoTotal } = req.body;

  try {
    const nuevaBalanceBunker = new BalanceBunker({
      idBunker,
      compra,
      venta,
      montoTotal,
    });

    await nuevaBalanceBunker.save();

    // Poblar referencias después de guardar
    await nuevaBalanceBunker.populate(populateOptions);

    res.status(201).json(nuevaBalanceBunker);
  } catch (err) {
    console.error("Error en balanceBunkerPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de balanceBunker no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la balanceBunker.",
    });
  }
};

// Actualizar una balanceBunker existente
const balanceBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const balanceBunkerActualizada = await BalanceBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!balanceBunkerActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(balanceBunkerActualizada);
  } catch (err) {
    console.error("Error en balanceBunkerPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balanceBunker no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la balanceBunker.",
    });
  }
};

// Eliminar (marcar como eliminado) una balanceBunker
const balanceBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const balanceBunker = await BalanceBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!balanceBunker) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(balanceBunker);
  } catch (err) {
    console.error("Error en balanceBunkerDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balanceBunker no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la balanceBunker.",
    });
  }
};

// Parchear una balanceBunker (ejemplo básico)
const balanceBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - balanceBunkerPatch",
  });
};

module.exports = {
  balanceBunkerGets,
  balanceBunkerGet,
  balanceBunkerPost,
  balanceBunkerPut,
  balanceBunkerDelete,
  balanceBunkerPatch,
};
