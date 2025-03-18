const { response, request } = require("express");
const chequeoCalidadBunker = require("../../models/bunker/chequeoCalidadBunker");
// const { Refinacion } = require("../models");
const { ChequeoCalidadBunker } = require("../../models");

// Opciones de populate reutilizables
const populateOptions = [
  {
    path: "idProducto",
    select: "nombre",
  },
  {
    path: "idTanque",
    select: "nombre",
  },
  {
    path: "idTorre",
    select: "nombre",
  },
  {
    path: "idRefineria",
    select: "nombre",
  },
  {
    path: "idRefinacion",
    select: "descripcion",
  },
];

// Obtener todos los chequeos de calidad con paginación y población de referencias
const chequeoCalidadBunkerGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, chequeoCalidadBunkers] = await Promise.all([
      ChequeoCalidadBunker.countDocuments(query),
      ChequeoCalidadBunker.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      chequeoCalidadBunkers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de calidad específico por ID
const chequeoCalidadBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCalidadBunker = await ChequeoCalidadBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!chequeoCalidadBunker) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoCalidadBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de calidad
const chequeoCalidadBunkerPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idProducto,
    idTanque,
    idTorre,
    idRefinacion,
    operador,
    fechaChequeo,
    gravedadAPI,
    azufre,
    viscosidad,
    densidad,
    contenidoAgua,
    contenidoPlomo,
    octanaje,
    temperatura,
  } = req.body;

  try {
    const nuevoChequeoCalidadBunker = new ChequeoCalidadBunker({
      idRefineria,
      idProducto,
      idTanque,
      idTorre,
      idRefinacion,
      operador,
      fechaChequeo,
      gravedadAPI,
      azufre,
      viscosidad,
      densidad,
      contenidoAgua,
      contenidoPlomo,
      octanaje,
      temperatura,
    });

    await nuevoChequeoCalidadBunker.save();

    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idChequeoCalidadBunker: nuevoChequeoCalidadBunker._id } },
      { new: true }
    );

    await nuevoChequeoCalidadBunker.populate(populateOptions);

    res.status(201).json(nuevoChequeoCalidadBunker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de calidad existente
const chequeoCalidadBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idRefinacion, ...resto } = req.body;

  try {
    const chequeoCalidadBunkerActualizado = await ChequeoCalidadBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCalidadBunkerActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idChequeoCalidadBunker: id },
        { $pull: { idChequeoCalidadBunker: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idChequeoCalidadBunker: id } },
        { new: true }
      );
    }
    res.json(chequeoCalidadBunkerActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCalidadBunker = await ChequeoCalidadBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCalidadBunker) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    // Eliminar la referencia en la colección de refinación
    await Refinacion.updateMany(
      { idChequeoCalidadBunker: id },
      { $pull: { idChequeoCalidadBunker: id } }
    );

    res.json(chequeoCalidadBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de calidad (ejemplo básico)
const chequeoCalidadBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCalidadBunkerPatch",
  });
};

module.exports = {
  chequeoCalidadBunkerGets,
  chequeoCalidadBunkerGet,
  chequeoCalidadBunkerPost,
  chequeoCalidadBunkerPut,
  chequeoCalidadBunkerDelete,
  chequeoCalidadBunkerPatch,
};
