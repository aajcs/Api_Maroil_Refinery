const { response, request } = require("express");
const RecepcionBK = require("../../models/bunkering/recepcionBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato", // Relación con el modelo Contrato
    select: "idItems numeroContrato", // Selecciona los campos idItems y numeroContrato
    populate: {
      path: "idItems", // Relación con los ítems del contrato
      populate: [
        { path: "producto", select: "nombre" }, // Relación con el modelo Producto
        { path: "idTipoProducto", select: "nombre" }, // Relación con el modelo TipoProducto
      ],
    },
  },
  { path: "idContratoItems", populate: { path: "producto", select: "nombre" } },
  { path: "idLinea", select: "nombre" },
  { path: "idBunkering", select: "nombre" },
  { path: "idMuelle", select: "nombre" },
  { path: "idEmbarcacion", select: "nombre" },
  { path: "idProducto", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idChequeoCalidad" },
  { path: "idChequeoCantidad" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todas las recepcions con historial ordenado
const recepcionBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, recepcions] = await Promise.all([
      RecepcionBK.countDocuments(query),
      RecepcionBK.find(query).populate(populateOptions),
    ]);

    // Ordenar historial por fecha descendente en cada recepción
    recepcions.forEach((r) => {
      if (Array.isArray(r.historial)) {
        r.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, recepcions });
  } catch (err) {
    console.error("Error en recepcionBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las recepcions.",
    });
  }
};

// Obtener una recepción específica por ID
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

    // Ordenar historial por fecha descendente
    if (Array.isArray(recepcion.historial)) {
      recepcion.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
  const {
    idContrato,
    idContratoItems,
    idLinea,
    idBunkering,
    idMuelle,
    idEmbarcacion,
    idProducto,
    idTanque,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoRecepcion,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioRecepcion,
    fechaFinRecepcion,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    tipo,
    tractomula,
    muelle,
    bunkering,
    idGuia,
    placa,
    nombreChofer,
  } = req.body;

  try {
    const nuevaRecepcion = new RecepcionBK({
      idContrato,
      idContratoItems,
      idLinea,
      idBunkering,
      idMuelle,
      idEmbarcacion,
      idProducto,
      idTanque,
      idChequeoCalidad,
      idChequeoCantidad,
      cantidadRecibida,
      cantidadEnviada,
      estadoRecepcion,
      estadoCarga,
      estado,
      fechaInicio,
      fechaFin,
      fechaInicioRecepcion,
      fechaFinRecepcion,
      fechaSalida,
      fechaLlegada,
      fechaDespacho,
      tipo,
      tractomula,
      muelle,
      bunkering,
      idGuia,
      placa,
      nombreChofer,
      createdBy: req.usuario._id,
    });

    await nuevaRecepcion.save();
    await nuevaRecepcion.populate(populateOptions);
    res.status(201).json({ recepcion: nuevaRecepcion }); // Responde con la recepción creada
  } catch (err) {
    console.error("Error en recepcionBKPost:", err);
    res.status(400).json({
      error: "Error al crear la recepción. Verifica los datos proporcionados.",
    });
  }
};

// Actualizar una recepción existente con historial de modificaciones
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
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const recepcionActualizada = await RecepcionBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!recepcionActualizada) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }

    res.json(recepcionActualizada);
  } catch (err) {
    console.error("Error en recepcionBKPut:", err);
    res.status(400).json({
      error:
        "Error al actualizar la recepción. Verifica los datos proporcionados.",
    });
  }
};

// Eliminar (marcar como eliminado) una recepción con historial de auditoría
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
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!recepcionEliminada) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }

    res.json(recepcionEliminada);
  } catch (err) {
    console.error("Error en recepcionBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la recepción.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const recepcionBKPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const recepcionActualizada = await RecepcionBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!recepcionActualizada) {
      return res.status(404).json({ msg: "Recepción no encontrada" });
    }

    res.json(recepcionActualizada);
  } catch (err) {
    console.error("Error en recepcionBKPatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente la recepción.",
    });
  }
};

module.exports = {
  recepcionBKPost,
  recepcionBKGet,
  recepcionBKGets,
  recepcionBKPut,
  recepcionBKDelete,
  recepcionBKPatch,
};
