const { response, request } = require("express");
const ChequeoCantidadBunker = require("../../models/bunker/chequeoCantidadBunker");
// const { Refinacion } = require("../models");

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

// Obtener todos los chequeos de cantidad con paginación y población de referencias
const chequeoCantidadBunkerGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, chequeoCantidadBunkers] = await Promise.all([
      ChequeoCantidadBunker.countDocuments(query),
      ChequeoCantidadBunker.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      chequeoCantidadBunkers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de cantidad específico por ID
const chequeoCantidadBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidadBunker = await ChequeoCantidadBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!chequeoCantidadBunker) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoCantidadBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de cantidad
const chequeoCantidadBunkerPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idProducto,
    idTanque,
    idTorre,
    idRefinacion,
    operador,
    fechaChequeo,
    cantidad,
  } = req.body;

  try {
    const nuevoChequeoCantidadBunker = new ChequeoCantidadBunker({
      idRefineria,
      idProducto,
      idTanque,
      idTorre,
      idRefinacion,
      operador,
      fechaChequeo,
      cantidad,
    });

    await nuevoChequeoCantidadBunker.save();

    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idChequeoCantidadBunker: nuevoChequeoCantidadBunker._id } },
      { new: true }
    );

    await nuevoChequeoCantidadBunker.populate(populateOptions);
    res.status(201).json(nuevoChequeoCantidadBunker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de cantidad existente
const chequeoCantidadBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idRefinacion, ...resto } = req.body;
  console.log(idRefinacion);
  try {
    const chequeoCantidadBunkerActualizado = await ChequeoCantidadBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCantidadBunkerActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idChequeoCantidadBunker: id },
        { $pull: { idChequeoCantidadBunker: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idChequeoCantidadBunker: id } },
        { new: true }
      );
    }
    res.json(chequeoCantidadBunkerActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCantidadBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidadBunker = await ChequeoCantidadBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCantidadBunker) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    // Eliminar la referencia en la colección de refinación
    await Refinacion.updateMany(
      { idChequeoCantidadBunker: id },
      { $pull: { idChequeoCantidadBunker: id } }
    );

    res.json(chequeoCantidadBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de calidad (ejemplo básico)
const chequeoCantidadBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCantidadBunkerPatch",
  });
};

module.exports = {
  chequeoCantidadBunkerGets,
  chequeoCantidadBunkerGet,
  chequeoCantidadBunkerPost,
  chequeoCantidadBunkerPut,
  chequeoCantidadBunkerDelete,
  chequeoCantidadBunkerPatch,
};
