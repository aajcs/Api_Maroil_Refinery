const { response, request } = require("express");
const RecepcionBK = require("../../models");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idContrato", select: "numeroContrato descripcion" },
  { path: "idContratoItems", select: "descripcion" },
  { path: "idLinea", select: "nombre" },
  { path: "idBunkering", select: "nombre" },
  { path: "idMuelle", select: "nombre" },
  { path: "idEmbarcacion", select: "nombre" },
  { path: "idProductoBK", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idChequeoCalidad", select: "resultado" },
  { path: "idChequeoCantidad", select: "resultado" },
  { path: "tractomula.datosChofer" }, // Si tienes referencia
];

// Obtener todas las recepciones
const recepcionBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, recepciones] = await Promise.all([
      RecepcionBK.countDocuments(query),
      RecepcionBK.find(query).populate(populateOptions).sort({ createdAt: -1 }),
    ]);
    res.json({ total, recepciones });
  } catch (err) {
    console.error("Error en recepcionBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las recepciones.",
    });
  }
};

// Obtener una recepción por ID
const recepcionBKGet = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const recepcion = await RecepcionBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!recepcion) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }

    res.json(recepcion);
  } catch (err) {
    console.error("Error en recepcionBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la recepción.",
    });
  }
};

// Crear una nueva recepción
const recepcionBKPost = async (req = request, res = response) => {
  try {
    const data = req.body;
    data.createdBy = req.usuario?._id; // Si usas auditoría de usuario

    const nuevaRecepcion = new RecepcionBK(data);
    await nuevaRecepcion.save();
    await nuevaRecepcion.populate(populateOptions);

    res.status(201).json(nuevaRecepcion);
  } catch (err) {
    console.error("Error en recepcionBKPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear la recepción.",
    });
  }
};

// Actualizar una recepción existente
const recepcionBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await RecepcionBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }
    const cambios = {};
    for (let key in resto) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const recepcionActualizada = await RecepcionBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!recepcionActualizada) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }

    res.json(recepcionActualizada);
  } catch (err) {
    console.error("Error en recepcionBKPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la recepción.",
    });
  }
};

// Eliminar (marcar como eliminada) una recepción
const recepcionBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await RecepcionBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const recepcionEliminada = await RecepcionBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!recepcionEliminada) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }

    res.json({
      msg: "Recepción eliminada correctamente.",
      recepcion: recepcionEliminada,
    });
  } catch (err) {
    console.error("Error en recepcionBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la recepción.",
    });
  }
};

module.exports = {
  recepcionBKGets,
  recepcionBKGet,
  recepcionBKPost,
  recepcionBKPut,
  recepcionBKDelete,
};