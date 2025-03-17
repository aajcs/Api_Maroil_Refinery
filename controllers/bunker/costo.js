const { response, request } = require("express");
const Costo = require("../models/costo");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idBunker", select: "nombre" },
  { path: "idContrato" },
];

// Obtener todas las costoes con paginación y población de referencias
const costoGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, costos] = await Promise.all([
      Costo.countDocuments(query), // Contar documentos
      Costo.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (costos.length === 0) {
      return res.status(404).json({
        message: "No se encontraron costos con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, costos });
  } catch (err) {
    console.error("Error en costoGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las costoes.",
    });
  }
};

// Obtener una refinación específica por ID
const costoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const costo = await Costo.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!costo) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(costo);
  } catch (err) {
    console.error("Error en costoGet:", err);

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
const costoPost = async (req = request, res = response) => {
  const { idBunker, idContratoCompra, costos, costoTotal } = req.body;

  try {
    const nuevaCosto = new Costo({
      idBunker,
      idContratoCompra,
      costos,
      costoTotal,
    });

    await nuevaCosto.save();

    // Poblar referencias después de guardar
    await nuevaCosto.populate(populateOptions);

    res.status(201).json(nuevaCosto);
  } catch (err) {
    console.error("Error en costoPost:", err);

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
const costoPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const costoActualizada = await Costo.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!costoActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(costoActualizada);
  } catch (err) {
    console.error("Error en costoPut:", err);

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
const costoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const costo = await Costo.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!costo) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(costo);
  } catch (err) {
    console.error("Error en costoDelete:", err);

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
const costoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - costoPatch",
  });
};

module.exports = {
  costoGets,
  costoGet,
  costoPost,
  costoPut,
  costoDelete,
  costoPatch,
};
