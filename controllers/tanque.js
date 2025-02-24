const { response, request } = require("express");
const Tanque = require("../models/tanque");

// Obtener todos los tanques con paginación y población de referencias
const tanqueGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  try {
    const [total, tanques] = await Promise.all([
      Tanque.countDocuments(query),
      Tanque.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate({
          path: "idRefineria",
          select: "nombre",
        }),
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
    }).populate({
      path: "idRefineria",
      select: "nombre",
    });

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
  const { nombre, ubicacion, capacidad, material, almacenamiento, idRefineria } = req.body;

  try {
    const nuevoTanque = new Tanque({
      nombre,
      ubicacion,
      capacidad,
      material,
      almacenamiento,
      idRefineria,
    });

    await nuevoTanque.save();

    await nuevoTanque.populate({
      path: "idRefineria",
      select: "nombre",
    });

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
    ).populate({
      path: "idRefineria",
      select: "nombre",
    });

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
    ).populate({
      path: "idRefineria",
      select: "nombre",
    });

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