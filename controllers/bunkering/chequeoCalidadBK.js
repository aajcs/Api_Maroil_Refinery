// Importaciones necesarias
const { response, request } = require("express");
const mongoose = require("mongoose");
const ChequeoCalidadBK = require("../../models/bunkering/chequeoCalidadBK");
const Counter = require("../../models/counter");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  {
    path: "aplicar.idReferencia",
    select: {
      nombre: 1,
      idGuia: 1,
    },
  },
  { path: "idProducto", select: "nombre" },
  { path: "idOperador", select: "nombre" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Controlador para obtener todos los chequeos de calidad
const chequeoCalidadBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, chequeos] = await Promise.all([
      ChequeoCalidadBK.countDocuments(query),
      ChequeoCalidadBK.find(query).populate(populateOptions),
    ]);

    // Ordenar historial por fecha descendente
    chequeos.forEach((c) => {
      if (Array.isArray(c.historial)) {
        c.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, chequeos });
  } catch (err) {
    console.error("Error en chequeoCalidadBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los chequeos de calidad.",
    });
  }
};

// Controlador para obtener un chequeo de calidad específico por ID
const chequeoCalidadBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeo = await ChequeoCalidadBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado." });
    }

    // Ordenar historial por fecha descendente
    if (Array.isArray(chequeo.historial)) {
      chequeo.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    res.json(chequeo);
  } catch (err) {
    console.error("Error en chequeoCalidadBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el chequeo de calidad.",
    });
  }
};

// Controlador para crear un nuevo chequeo de calidad
const chequeoCalidadBKPost = async (req = request, res = response) => {
  const {
    idBunkering,
    aplicar,
    idProducto,
    fechaChequeo,
    gravedadAPI,
    azufre,
    contenidoAgua,
    puntoDeInflamacion,
    cetano,
    idOperador,
    estado,
  } = req.body;

  try {
    const nuevoChequeo = new ChequeoCalidadBK({
      idBunkering,
      aplicar,
      idProducto,
      fechaChequeo,
      gravedadAPI,
      azufre,
      contenidoAgua,
      puntoDeInflamacion,
      cetano,
      idOperador,
      estado,
      createdBy: req.usuario._id,
    });

    await nuevoChequeo.save();
    await nuevoChequeo.populate(populateOptions);

    res.status(201).json(nuevoChequeo);
  } catch (err) {
    console.error("Error en chequeoCalidadBKPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear el chequeo de calidad.",
    });
  }
};

// Controlador para actualizar un chequeo de calidad existente
const chequeoCalidadBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, aplicar, ...resto } = req.body;

  try {
    const antes = await ChequeoCalidadBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const chequeoActualizado = await ChequeoCalidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        aplicar,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado." });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCalidadBKPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el chequeo de calidad.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await ChequeoCalidadBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const chequeoEliminado = await ChequeoCalidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoEliminado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado." });
    }

    res.json(chequeoEliminado);
  } catch (err) {
    console.error("Error en chequeoCalidadBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el chequeo de calidad.",
    });
  }
};

// Exporta los controladores con los nuevos nombres
module.exports = {
  chequeoCalidadBKGets,
  chequeoCalidadBKGet,
  chequeoCalidadBKPost,
  chequeoCalidadBKPut,
  chequeoCalidadBKDelete,
};
