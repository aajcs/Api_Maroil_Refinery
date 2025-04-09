const { response, request } = require("express");
const CorteRefinacion = require("../models/corteRefinacion");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  { path: "idOperador", select: "nombre" },
  { path: "corteTorre.idTorre", select: "nombre" },
  { path: "corteTorre.detalles.idTanque", select: "nombre" },
  { path: "corteTorre.detalles.idProducto", select: "nombre" },
];

// Controlador para obtener todas las refinaciones con paginación y población de referencias
const corteRefinacionGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo cortes no eliminados

  try {
    const [total, corteRefinacions] = await Promise.all([
      CorteRefinacion.countDocuments(query), // Cuenta el total de cortes
      CorteRefinacion.find(query).populate(populateOptions), // Obtiene los cortes con referencias pobladas
    ]);

    res.json({ total, corteRefinacions }); // Responde con el total y la lista de cortes
  } catch (err) {
    console.error("Error en corteRefinacionGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener los cortes de refinación.",
    });
  }
};

// Controlador para obtener un corte específico por ID
const corteRefinacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const corte = await CorteRefinacion.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!corte) {
      return res.status(404).json({ msg: "Corte de refinación no encontrado" });
    }

    res.json(corte);
  } catch (err) {
    console.error("Error en corteRefinacionGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de corte de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener el corte de refinación.",
    });
  }
};

// Controlador para crear un nuevo corte de refinación
const corteRefinacionPost = async (req = request, res = response) => {
  const {
    idRefineria,
    corteTorre,
    numeroCorteRefinacion,
    fechaCorte,
    observacion,
    idOperador,
    estado,
  } = req.body;

  try {
    const nuevoCorte = new CorteRefinacion({
      idRefineria,
      corteTorre,
      numeroCorteRefinacion,
      fechaCorte,
      observacion,
      idOperador,
      estado,
    });

    await nuevoCorte.save(); // Guarda el nuevo corte en la base de datos

    // Poblar referencias después de guardar
    await nuevoCorte.populate(populateOptions);

    res.status(201).json(nuevoCorte); // Responde con el corte creado
  } catch (err) {
    console.error("Error en corteRefinacionPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos del corte de refinación no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el corte de refinación.",
    });
  }
};

// Controlador para actualizar un corte de refinación existente
const corteRefinacionPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const corteActualizado = await CorteRefinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!corteActualizado) {
      return res.status(404).json({ msg: "Corte de refinación no encontrado" });
    }

    res.json(corteActualizado);
  } catch (err) {
    console.error("Error en corteRefinacionPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de corte de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el corte de refinación.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un corte de refinación
const corteRefinacionDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const corte = await CorteRefinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!corte) {
      return res.status(404).json({ msg: "Corte de refinación no encontrado" });
    }

    res.json(corte);
  } catch (err) {
    console.error("Error en corteRefinacionDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de corte de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el corte de refinación.",
    });
  }
};

// Controlador para manejar solicitudes PATCH
const corteRefinacionPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const corteActualizado = await CorteRefinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!corteActualizado) {
      return res.status(404).json({ msg: "Corte de refinación no encontrado" });
    }

    res.json(corteActualizado);
  } catch (err) {
    console.error("Error en corteRefinacionPatch:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de corte de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar parcialmente el corte.",
    });
  }
};

// Exporta los controladores
module.exports = {
  corteRefinacionGets,
  corteRefinacionGet,
  corteRefinacionPost,
  corteRefinacionPut,
  corteRefinacionDelete,
  corteRefinacionPatch,
};
