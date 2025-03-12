const { response, request } = require("express");
const Tanque = require("../models/tanque");

const populateOptions = [
  {
    path: "idRefineria",
    select: "nombre",
  },
  { path: "idProducto", select: "nombre color" },
];

// Obtener todos los tanques con paginación y población de referencias
const tanqueGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, tanques] = await Promise.all([
      Tanque.countDocuments(query),
      Tanque.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      tanques,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un tanque específico por ID
const tanqueGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const tanque = await Tanque.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!tanque) {
      return res.status(404).json({ msg: "Tanque no encontrado" });
    }

    res.json(tanque);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo tanque
const tanquePost = async (req = request, res = response) => {
  const {
    nombre,
    ubicacion,
    capacidad,
    material,
    almacenamiento,
    almacenamientoMateriaPrimaria,
    idRefineria,
    idProducto,
  } = req.body;

  try {
    const nuevoTanque = new Tanque({
      nombre,
      ubicacion,
      capacidad,
      material,
      almacenamiento,
      almacenamientoMateriaPrimaria,
      idRefineria,
      idProducto,
    });

    await nuevoTanque.save();

    await nuevoTanque.populate(populateOptions);

    res.status(201).json(nuevoTanque);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un tanque existente
const tanquePut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const tanqueActualizado = await Tanque.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!tanqueActualizado) {
      return res.status(404).json({ msg: "Tanque no encontrado" });
    }

    res.json(tanqueActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un tanque
const tanqueDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const tanque = await Tanque.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!tanque) {
      return res.status(404).json({ msg: "Tanque no encontrado" });
    }

    res.json(tanque);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un tanque (ejemplo básico)
const tanquePatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - tanquePatch",
  });
};

module.exports = {
  tanquePost,
  tanqueGet,
  tanqueGets,
  tanquePut,
  tanqueDelete,
  tanquePatch,
};
