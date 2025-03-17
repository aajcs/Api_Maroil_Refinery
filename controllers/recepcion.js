const { response, request } = require("express");
const Recepcion = require("../models/recepcion");
const Contrato = require("../models/contrato");

const populateOptions = [
  {
    path: "idContrato",
    select: "idItems numeroContrato",
    populate: {
      path: "idItems",
      populate: [{ path: "producto", select: "nombre" }],
    },
  },

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
];
// Obtener todas las recepcions con paginación y población de referencias
const recepcionGets = async (req = request, res = response) => {
  const query = {};

  try {
    const [total, recepcions] = await Promise.all([
      Recepcion.countDocuments(query),
      Recepcion.find(query).populate(populateOptions),
    ]);

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

const recepcionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const recepcionActualizada = await Recepcion.findById(id).populate(
      populateOptions
    );
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
const recepcionPost = async (req, res = response) => {
  const {
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,

    // Información de la recepción
    cantidadRecibida,
    cantidadEnviada,
    estadoCarga,
    estado,

    // Fechas
    fechaInicio,
    fechaFin,
    fechaDespacho,

    // Información del transporte
    idGuia,
    placa,
    nombreChofer,
    apellidoChofer,
  } = req.body;

  const nuevaRecepcion = new Recepcion({
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,

    // Información de la recepción
    cantidadRecibida,
    cantidadEnviada,
    estadoCarga,
    estado,

    // Fechas
    fechaInicio,
    fechaFin,
    fechaDespacho,

    // Información del transporte
    idGuia,
    placa,
    nombreChofer,
    apellidoChofer,
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
const recepcionPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const recepcionActualizada = await Recepcion.findByIdAndUpdate(id, resto, {
      new: true,
    }).populate(populateOptions);

    if (!recepcionActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
    req.io.emit("recepcion-modificada", recepcionActualizada);
    res.json(recepcionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una recepción
const recepcionDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const recepcion = await Recepcion.findByIdAndUpdate(
      id,
      { eliminado: true },
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

const recepcionPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  recepcionPost,
  recepcionGet,
  recepcionGets,
  recepcionPut,
  recepcionDelete,
  recepcionPatch,
};
