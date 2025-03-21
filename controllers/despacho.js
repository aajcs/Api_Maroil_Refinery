const { response, request } = require("express");
const Despacho = require("../models/despacho");
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
// Obtener todas las despachos con paginación y población de referencias
const despachoGets = async (req = request, res = response) => {
  const query = {};

  try {
    const [total, despachos] = await Promise.all([
      Despacho.countDocuments(query),
      Despacho.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      despachos,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una recepción específica por ID

const despachoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const despachoActualizada = await Despacho.findById(id).populate(
      populateOptions
    );
    if (despachoActualizada) {
      res.json(despachoActualizada);
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
const despachoPost = async (req, res = response) => {
  const {
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,

    // Información de la recepción
    cantidadDespacho,
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

  const nuevaDespacho = new Despacho({
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,

    // Información de la recepción
    cantidadDespacho,
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
    await nuevaDespacho.save();

    await nuevaDespacho.populate(populateOptions);

    res.json({ despacho: nuevaDespacho });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una recepción existente
const despachoPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const despachoActualizada = await Despacho.findByIdAndUpdate(id, resto, {
      new: true,
    }).populate(populateOptions);

    if (!despachoActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
    req.io.emit("despacho-modificada", despachoActualizada);
    res.json(despachoActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una recepción
const despachoDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const despacho = await Despacho.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!despacho) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }

    res.json(despacho);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const despachoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  despachoPost,
  despachoGet,
  despachoGets,
  despachoPut,
  despachoDelete,
  despachoPatch,
};
