const { response, request } = require("express");
const ChequeoCalidad = require("../models/chequeoCalidad");
const { Refinacion } = require("../models");

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
const chequeoCalidadGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, chequeoCalidads] = await Promise.all([
      ChequeoCalidad.countDocuments(query),
      ChequeoCalidad.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      chequeoCalidads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de calidad específico por ID
const chequeoCalidadGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCalidad = await ChequeoCalidad.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    })
      .populate({
        path: "idProducto",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      });

    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoCalidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de calidad
const chequeoCalidadPost = async (req = request, res = response) => {
  const {
    idProducto,
    idTanque,
    idTorre,
    idRefineria,
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
    const nuevoChequeoCalidad = new ChequeoCalidad({
      idProducto,
      idTanque,
      idTorre,
      idRefineria,
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

    await nuevoChequeoCalidad.save();

    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idChequeoCalidad: nuevoChequeoCalidad._id } },
      { new: true }
    );

    await nuevoChequeoCalidad.populate(populateOptions);

    res.status(201).json(nuevoChequeoCalidad);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de calidad existente
const chequeoCalidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idRefinacion, ...resto } = req.body;

  try {
    const chequeoCalidadActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCalidadActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idChequeoCalidad: id },
        { $pull: { idChequeoCalidad: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idChequeoCalidad: id } },
        { new: true }
      );
    }
    res.json(chequeoCalidadActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCalidad = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    // Eliminar la referencia en la colección de refinación
    await Refinacion.updateMany(
      { idChequeoCalidad: id },
      { $pull: { idChequeoCalidad: id } }
    );

    res.json(chequeoCalidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de calidad (ejemplo básico)
const chequeoCalidadPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCalidadPatch",
  });
};

module.exports = {
  chequeoCalidadGets,
  chequeoCalidadGet,
  chequeoCalidadPost,
  chequeoCalidadPut,
  chequeoCalidadDelete,
  chequeoCalidadPatch,
};
