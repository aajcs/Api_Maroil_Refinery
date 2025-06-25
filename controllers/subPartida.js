// Importaciones necesarias
const { response, request } = require("express");
const mongoose = require("mongoose");
const SubPartida = require("../models/subPartida");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  { path: "idPartida" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Controlador para obtener todas las subpartidas
const subPartidaGets = async (req = request, res = response, next) => {
  const query = { eliminado: false };

  try {
    const [total, subPartidas] = await Promise.all([
      SubPartida.countDocuments(query),
      SubPartida.find(query).populate(populateOptions),
    ]);

    res.json({ total, subPartidas });
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para obtener una subpartida específica por ID
const subPartidaGet = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const subPartida = await SubPartida.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!subPartida) {
      return res.status(404).json({ msg: "Subpartida no encontrada." });
    }

    res.json(subPartida);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para crear una nueva subpartida
const subPartidaPost = async (req = request, res = response, next) => {
  const { idRefineria, idPartida, descripcion, codigo } = req.body;

  try {
    const nuevaSubPartida = new SubPartida({
      idRefineria,
      idPartida,
      descripcion,
      codigo,
      createdBy: req.usuario._id,
    });

    await nuevaSubPartida.save();

    const subPartidaPopulada = await SubPartida.findById(
      nuevaSubPartida._id
    ).populate(populateOptions);

    res.status(201).json(subPartidaPopulada);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para actualizar una subpartida existente
const subPartidaPut = async (req = request, res = response, next) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await SubPartida.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Subpartida no encontrada." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const subPartidaActualizada = await SubPartida.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!subPartidaActualizada) {
      return res.status(404).json({ msg: "Subpartida no encontrada." });
    }

    res.json(subPartidaActualizada);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para eliminar (marcar como eliminada) una subpartida
const subPartidaDelete = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const antes = await SubPartida.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Subpartida no encontrada." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const subPartidaEliminada = await SubPartida.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!subPartidaEliminada) {
      return res.status(404).json({ msg: "Subpartida no encontrada." });
    }

    res.json(subPartidaEliminada);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const subPartidaPatch = async (req = request, res = response, next) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const subPartidaActualizada = await SubPartida.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!subPartidaActualizada) {
      return res.status(404).json({ msg: "Subpartida no encontrada." });
    }

    res.json(subPartidaActualizada);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Exporta los controladores
module.exports = {
  subPartidaGets,
  subPartidaGet,
  subPartidaPost,
  subPartidaPut,
  subPartidaDelete,
  subPartidaPatch,
};
