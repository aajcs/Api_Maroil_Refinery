// const { response, request } = require("express");
const Torre = require("../models/torre");

// Obtener todas las torres con paginación y población de referencias
const torreGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, torres] = await Promise.all([
      Torre.countDocuments(query),
      Torre.find(query)
      .populate({
        path: "idRefineria",
        select: "nombre",
      }),
    ]);

    res.json({
      total,
      torres,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una torre específica por ID
const torreGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const torre = await Torre.findOne({
      _id: id,
      eliminado: false,
    }).populate({
      path: "idRefineria",
      select: "nombre",
    });

    if (!torre) {
      return res.status(404).json({ msg: "Torre no encontrada" });
    }

    res.json(torre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva torre
const torrePost = async (req = request, res = response) => {
  const {
    nombre,
    ubicacion,
    capacidad,
    material,
    almacenamiento,
    numero,
    idRefineria,
  } = req.body;

  try {
    const nuevaTorre = new Torre({
      nombre,
      ubicacion,
      capacidad,
      material,
      almacenamiento,
      numero,
      idRefineria,
    });

    await nuevaTorre.save();

    await nuevaTorre.populate({
      path: "idRefineria",
      select: "nombre",
    });

    res.status(201).json(nuevaTorre);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una torre existente
const torrePut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const torreActualizada = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate({
      path: "idRefineria",
      select: "nombre",
    });

    if (!torreActualizada) {
      return res.status(404).json({ msg: "Torre no encontrada" });
    }

    res.json(torreActualizada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una torre
const torreDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const torre = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate({
      path: "idRefineria",
      select: "nombre",
    });

    if (!torre) {
      return res.status(404).json({ msg: "Torre no encontrada" });
    }

    res.json(torre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una torre (ejemplo básico)
const torrePatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - torrePatch",
  });
};

module.exports = {
  torrePost,
  torreGet,
  torreGets,
  torrePut,
  torreDelete,
  torrePatch,
};
