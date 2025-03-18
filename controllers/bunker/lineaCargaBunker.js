const { response, request } = require("express");
const LineaCargaBunker = require("../../models/bunker/lineaCargaBunker");

// Opciones de populate reutilizables
const populateOptions = [{ path: "idBunker", select: "nombre" }];

// Obtener todas las líneas de carga con paginación y población de referencias
const lineaCargaBunkerGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, lineaCargaBunkers] = await Promise.all([
      LineaCargaBunker.countDocuments(query),
      LineaCargaBunker.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      lineaCargaBunkers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una línea de carga específica por ID
const lineaCargaBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const lineaCargaBunker = await LineaCargaBunker.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!lineaCargaBunker) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCargaBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva línea de carga
const lineaCargaBunkerPost = async (req = request, res = response) => {
  const { ubicacion, nombre, idBunker } = req.body;

  try {
    const nuevaLineaCargaBunker = new LineaCargaBunker({
      ubicacion,
      nombre,
      idBunker,
    });

    await nuevaLineaCargaBunker.save();

    await nuevaLineaCargaBunker.populate(populateOptions);

    res.status(201).json(nuevaLineaCargaBunker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una línea de carga existente
const lineaCargaBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const lineaCargaBunkerActualizada = await LineaCargaBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);
    if (!lineaCargaBunkerActualizada) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCargaBunkerActualizada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una línea de carga
const lineaCargaBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const lineaCargaBunker = await LineaCargaBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);
    if (!lineaCargaBunker) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCargaBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una línea de carga (ejemplo básico)
const lineaCargaBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - lineaCargaBunkerPatch",
  });
};

module.exports = {
  lineaCargaBunkerPost,
  lineaCargaBunkerGet,
  lineaCargaBunkerGets,
  lineaCargaBunkerPut,
  lineaCargaBunkerDelete,
  lineaCargaBunkerPatch,
};
