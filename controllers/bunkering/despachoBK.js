const { response, request } = require("express");
const DespachoBK = require("../../models");

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

// Obtener todas las despachos
const despachoBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, despachosBK] = await Promise.all([
      DespachoBK.countDocuments(query),
      DespachoBK.find(query).populate(populateOptions).sort({ createdAt: -1 }),
    ]);
    res.json({ total, despachos });
  } catch (err) {
    console.error("Error en despachoBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las despachos.",
    });
  }
};

// Obtener una despacho por ID
const despachoBKGet = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const despacho = await DespachoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!despacho) {
      return res.status(404).json({ msg: "Despacho no encontrada" });
    }

    res.json(despacho);
  } catch (err) {
    console.error("Error en despachoBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la despacho.",
    });
  }
};

// Crear una nueva despacho
const despachoBKPost = async (req = request, res = response) => {
  try {
    const data = req.body;
    data.createdBy = req.usuario?._id; // Si usas auditoría de usuario

    const nuevaRecepcion = new DespachoBK(data);
    await nuevaRecepcion.save();
    await nuevaRecepcion.populate(populateOptions);

    res.status(201).json(nuevaRecepcion);
  } catch (err) {
    console.error("Error en despachoBKPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear el despacho.",
    });
  }
};

// Actualizar una despacho existente
const despachoBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await DespachoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Despacho no encontrado" });
    }
    const cambios = {};
    for (let key in resto) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const despachoActualizada = await DespachoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!despachoActualizada) {
      return res.status(404).json({ msg: "Despacho no encontrada" });
    }

    res.json(despachoActualizada);
  } catch (err) {
    console.error("Error en despachoBKPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la despacho.",
    });
  }
};

// Eliminar (marcar como eliminada) una despacho
const despachoBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await DespachoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Despacho no encontrada" });
    }
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const despachoEliminada = await DespachoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!despachoEliminada) {
      return res.status(404).json({ msg: "Despacho no encontrado" });
    }

    res.json({
      msg: "Despacho eliminado correctamente.",
      despacho: despachoEliminada,
    });
  } catch (err) {
    console.error("Error en despachoBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el despacho.",
    });
  }
};

module.exports = {
  despachoBKGets,
  despachoBKGet,
  despachoBKPost,
  despachoBKPut,
  despachoBKDelete,
};