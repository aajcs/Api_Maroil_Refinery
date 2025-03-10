const { response, request } = require("express");
const LineaCarga = require("../models/lineaCarga");

// Obtener todas las líneas de carga con paginación y población de referencias
const lineaCargaGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, lineaCargas] = await Promise.all([
      LineaCarga.countDocuments(query),
      LineaCarga.find(query).populate({
        path: "idRefineria",
        select: "nombre",
      }),
    ]);

    res.json({
      total,
      lineaCargas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una línea de carga específica por ID
const lineaCargaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const lineaCarga = await LineaCarga.findOne({
      _id: id,
      eliminado: false,
    }).populate({
      path: "idRefineria",
      select: "nombre",
    });

    if (!lineaCarga) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCarga);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva línea de carga
const lineaCargaPost = async (req = request, res = response) => {
  const { ubicacion, nombre, idRefineria } = req.body;

  try {
    const nuevaLineaCarga = new LineaCarga({
      ubicacion,
      nombre,
      idRefineria,
    });

    await nuevaLineaCarga.save();

    await nuevaLineaCarga.populate({
      path: "idRefineria",
      select: "nombre",
    });

    res.status(201).json(nuevaLineaCarga);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una línea de carga existente
const lineaCargaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const lineaCargaActualizada = await LineaCarga.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate({
      path: "idRefineria",
      select: "nombre",
    });

    if (!lineaCargaActualizada) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCargaActualizada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una línea de carga
const lineaCargaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const lineaCarga = await LineaCarga.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate({
      path: "idRefineria",
      select: "nombre",
    });

    if (!lineaCarga) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCarga);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una línea de carga (ejemplo básico)
const lineaCargaPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - lineaCargaPatch",
  });
};

module.exports = {
  lineaCargaPost,
  lineaCargaGet,
  lineaCargaGets,
  lineaCargaPut,
  lineaCargaDelete,
  lineaCargaPatch,
};
