const { response, request } = require("express");
const Balance = require("../models/balance");
const { selectFields } = require("express-validator/src/select-fields");

// Opciones de populate reutilizables
const populateOptions = [
  { path: "idBunker", select: "nombre" },
  { path: "venta", select: "montoTotal" },
  { path: "compra", select: "montoTotal" },
];

// Obtener todas las balancees con paginación y población de referencias
const balanceGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, balances] = await Promise.all([
      Balance.countDocuments(query), // Contar documentos
      Balance.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (balances.length === 0) {
      return res.status(404).json({
        message: "No se encontraron balances con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, balances });
  } catch (err) {
    console.error("Error en balanceGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las balancees.",
    });
  }
};

// Obtener una balance específica por ID
const balanceGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const balance = await Balance.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!balance) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(balance);
  } catch (err) {
    console.error("Error en balanceGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balance no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la balance.",
    });
  }
};

// Crear una nueva balance
const balancePost = async (req = request, res = response) => {
  const { idBunker, compra, venta, montoTotal } = req.body;

  try {
    const nuevaBalance = new Balance({
      idBunker,
      compra,
      venta,
      montoTotal,
    });

    await nuevaBalance.save();

    // Poblar referencias después de guardar
    await nuevaBalance.populate(populateOptions);

    res.status(201).json(nuevaBalance);
  } catch (err) {
    console.error("Error en balancePost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de balance no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la balance.",
    });
  }
};

// Actualizar una balance existente
const balancePut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const balanceActualizada = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!balanceActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(balanceActualizada);
  } catch (err) {
    console.error("Error en balancePut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balance no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la balance.",
    });
  }
};

// Eliminar (marcar como eliminado) una balance
const balanceDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const balance = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!balance) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(balance);
  } catch (err) {
    console.error("Error en balanceDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balance no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la balance.",
    });
  }
};

// Parchear una balance (ejemplo básico)
const balancePatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - balancePatch",
  });
};

module.exports = {
  balanceGets,
  balanceGet,
  balancePost,
  balancePut,
  balanceDelete,
  balancePatch,
};
