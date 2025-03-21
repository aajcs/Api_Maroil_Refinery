const { response, request } = require("express");
const RefinacionSalida = require("../models/refinacionSalida");
const { Refinacion } = require("../models");

// Opciones de populate reutilizables
const populateOptions = [
  {
    path: "idRefinacion",
    select:
      "numeroRefinacion idTorre idProducto cantidadTotal derivado descripcion",
    populate: [
      { path: "idProducto", select: "nombre" },
      { path: "idTorre", select: "nombre" },
      {
        path: "derivado",
        populate: [{ path: "idProducto", select: "nombre" }],
      },
    ],
  },
  { path: "idTanque", select: "nombre" },
  {
    path: "idChequeoCalidad",
    select: "idProducto idTanque gravedadAPI azufre contenidoAgua",
    populate: [
      { path: "idProducto", select: "nombre" },
      { path: "idTanque", select: "nombre" },
    ],
  },
  {
    path: "idChequeoCantidad",
    select: "idProducto idTanque gravedadAPI azufre contenidoAgua",
    populate: [
      { path: "idProducto", select: "nombre" },
      { path: "idTanque", select: "nombre" },
    ],
  },
  { path: "idProducto", select: "nombre" },
  { path: "idRefineria", select: "nombre" },
];

// Obtener todas las refinacionSalidaes con paginación y población de referencias
const refinacionSalidaGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, refinacionSalidas] = await Promise.all([
      RefinacionSalida.countDocuments(query), // Contar documentos
      RefinacionSalida.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Respuesta exitosa
    res.json({ total, refinacionSalidas });
  } catch (err) {
    console.error("Error en refinacionSalidaGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las refinacionSalidaes.",
    });
  }
};

// Obtener una refinación específica por ID
const refinacionSalidaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacionSalida = await RefinacionSalida.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!refinacionSalida) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacionSalida);
  } catch (err) {
    console.error("Error en refinacionSalidaGet:", err);

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
const refinacionSalidaPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idRefinacion,
    idTanque,
    cantidad,
    descripcion,
    // idChequeoCalidad,
    // idChequeoCantidad,
    idProducto,
    operador,
    estadoRefinacionSalida,
    cantidadTotal,
    fechaFin,
  } = req.body;

  try {
    const nuevaRefinacionSalida = new RefinacionSalida({
      idRefineria,
      idRefinacion,
      idTanque,
      cantidad,
      descripcion,
      // idChequeoCalidad,
      // idChequeoCantidad,
      idProducto,
      operador,
      estadoRefinacionSalida,
      cantidadTotal,
      fechaFin,
    });

    await nuevaRefinacionSalida.save();

    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idRefinacionSalida: nuevaRefinacionSalida._id } },
      { new: true }
    );

    // Poblar referencias después de guardar
    await nuevaRefinacionSalida.populate(populateOptions);

    res.status(201).json(nuevaRefinacionSalida);
  } catch (err) {
    console.error("Error en refinacionSalidaPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de refinación no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la refinación de Salida.",
    });
  }
};

// Actualizar una refinación existente
const refinacionSalidaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idRefinacion, ...resto } = req.body;

  try {
    const refinacionSalidaActualizada = await RefinacionSalida.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!refinacionSalidaActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idRefinacionSalida: id },
        { $pull: { idRefinacionSalida: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idRefinacionSalida: id } },
        { new: true }
      );
    }
    res.json(refinacionSalidaActualizada);
  } catch (err) {
    console.error("Error en refinacionSalidaPut:", err);

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
const refinacionSalidaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacionSalida = await RefinacionSalida.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!refinacionSalida) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }
    await Refinacion.updateMany(
      { idRefinacionSalida: id },
      { $pull: { idRefinacionSalida: id } }
    );
    res.json(refinacionSalida);
  } catch (err) {
    console.error("Error en refinacionSalidaDelete:", err);

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
const refinacionSalidaPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refinacionSalidaPatch",
  });
};

module.exports = {
  refinacionSalidaGets,
  refinacionSalidaGet,
  refinacionSalidaPost,
  refinacionSalidaPut,
  refinacionSalidaDelete,
  refinacionSalidaPatch,
};
