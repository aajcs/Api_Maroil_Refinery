const { response, request } = require("express");
const RecepcionBK = require("../../models/bunkering/recepcionBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idContrato", select: "idItems numeroContrato" },
  { path: "idContratoItems", populate: { path: "producto", select: "nombre" } },
  { path: "idLinea", select: "nombre" },
  { path: "idBunkering", select: "nombre" },
  { path: "idMuelle", select: "nombre" },
  { path: "idEmbarcacion", select: "nombre" },
  { path: "idProductoBK", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idChequeoCalidad" },
  { path: "idChequeoCantidad" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todas las recepciones con población de referencias
const recepcionBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, recepciones] = await Promise.all([
      RecepcionBK.countDocuments(query),
      RecepcionBK.find(query).populate(populateOptions),
    ]);
    recepciones.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({
      total,
      recepciones,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una recepción específica por ID
const recepcionBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const recepcion = await RecepcionBK.findById(id).populate(populateOptions);
    if (recepcion && Array.isArray(recepcion.historial)) {
      recepcion.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    if (recepcion) {
      res.json(recepcion);
    } else {
      res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva recepción
const recepcionBKPost = async (req, res = response) => {
  try {
    const {
      idContrato,
      idContratoItems,
      idLinea,
      idBunkering,
      idMuelle,
      idEmbarcacion,
      idProductoBK,
      idTanque,
      idChequeoCalidad,
      idChequeoCantidad,
      cantidadRecibida,
      cantidadEnviada,
      estadoRecepcionBK,
      estadoCarga,
      estado,
      fechaInicio,
      fechaFin,
      fechaInicioRecepcionBK,
      fechaFinRecepcionBK,
      fechaSalida,
      fechaLlegada,
      fechaDespacho,
      tipo,
      tractomula,
      muelle,
      bunkering,
    } = req.body;

    // Construir el objeto según el tipo de recepción
    const recepcionData = {
      idContrato,
      idContratoItems,
      idLinea,
      idBunkering,
      idMuelle,
      idEmbarcacion,
      idProductoBK,
      idTanque,
      idChequeoCalidad,
      idChequeoCantidad,
      cantidadRecibida,
      cantidadEnviada,
      estadoRecepcionBK,
      estadoCarga,
      estado,
      fechaInicio,
      fechaFin,
      fechaInicioRecepcionBK,
      fechaFinRecepcionBK,
      fechaSalida,
      fechaLlegada,
      fechaDespacho,
      tipo,
      createdBy: req.usuario._id,
    };

    if (tipo === "Tractomula") {
      recepcionData.tractomula = tractomula;
    } else if (tipo === "Muelle") {
      recepcionData.muelle = muelle;
    } else if (tipo === "Bunkering") {
      recepcionData.bunkering = bunkering;
    }

    const nuevaRecepcion = new RecepcionBK(recepcionData);

    await nuevaRecepcion.save();
    await nuevaRecepcion.populate(populateOptions);
    res.status(201).json({ recepcion: nuevaRecepcion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una recepción existente
const recepcionBKPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await RecepcionBK.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }
    const recepcionActualizada = await RecepcionBK.findByIdAndUpdate(
      id,
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!recepcionActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
    req.io?.emit("recepcion-modificada", recepcionActualizada);
    res.json(recepcionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una recepción
const recepcionBKDelete = async (req, res = response) => {
  const { id } = req.params;
  try {
    const antes = await RecepcionBK.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };
    const recepcion = await RecepcionBK.findByIdAndUpdate(
      id,
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!recepcion) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }

    res.json(recepcion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const recepcionBKPatch = (req, res = response) => {
  res.json({
    msg: "patch API - recepcionBKPatch",
  });
};

module.exports = {
  recepcionBKPost,
  recepcionBKGet,
  recepcionBKGets,
  recepcionBKPut,
  recepcionBKDelete,
  recepcionBKPatch,
};
