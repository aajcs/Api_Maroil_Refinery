const { response, request } = require("express");
const RecepcionBK = require("../../models/bunkering/recepcionBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato",
    select: "idItems numeroContrato",
    populate: {
      path: "idItems",
      populate: [
        { path: "producto", select: "nombre" },
        { path: "idTipoProducto", select: "nombre" },
      ],
    },
  },
  { path: "idChequeoCalidad" },
  { path: "idChequeoCantidad" },
  { path: "idRefineria", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idLinea", select: "nombre" },
  {
    path: "idContratoItems",
    populate: {
      path: "producto",
      select: "nombre",
    },
  },
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
    const [total, recepcions] = await Promise.all([
      RecepcionBK.countDocuments(query),
      RecepcionBK.find(query).populate(populateOptions),
    ]);
    recepcions.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({
      total,
      recepcions,
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
    const recepcionActualizada = await RecepcionBK.findById(id).populate(populateOptions);
    if (recepcionActualizada && Array.isArray(recepcionActualizada.historial)) {
      recepcionActualizada.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    if (recepcionActualizada) {
      res.json(recepcionActualizada);
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
  const {
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
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
    idGuia,
    placa,
    tipo,
    nombreChofer,
  } = req.body;

  const nuevaRecepcion = new RecepcionBK({
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
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
    idGuia,
    placa,
    tipo,
    nombreChofer,
    createdBy: req.usuario._id,
  });

  try {
    await nuevaRecepcion.save();
    await nuevaRecepcion.populate(populateOptions);
    res.json({ recepcion: nuevaRecepcion });
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