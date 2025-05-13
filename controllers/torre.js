// Importación del modelo Torre
const Torre = require("../models/torre");

// Opciones de población para referencias en las consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  { path: "material.idProducto", select: "nombre posicion color" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Controlador para obtener todas las torres con paginación y población de referencias
const torreGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, torres] = await Promise.all([
      Torre.countDocuments(query),
      Torre.find(query).populate(populateOptions),
    ]);

    // Ordenar historial por fecha descendente en cada torre
    torres.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, torres });
  } catch (err) {
    console.error("Error en torreGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las torres.",
    });
  }
};

// Controlador para obtener una torre específica por ID
const torreGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const torre = await Torre.findOne({ _id: id, eliminado: false }).populate(
      populateOptions
    );

    if (!torre) {
      return res.status(404).json({ msg: "Torre no encontrada." });
    }

    // Ordenar historial por fecha descendente
    if (Array.isArray(torre.historial)) {
      torre.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    res.json(torre);
  } catch (err) {
    console.error("Error en torreGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la torre.",
    });
  }
};

// Controlador para crear una nueva torre
const torrePost = async (req = request, res = response) => {
  const {
    idRefineria,
    almacenamiento,
    capacidad,
    material,
    numero,
    nombre,
    ubicacion,
  } = req.body;

  try {
    const nuevaTorre = new Torre({
      idRefineria,
      almacenamiento,
      capacidad,
      material,
      numero,
      nombre,
      ubicacion,
      createdBy: req.usuario._id,
    });

    await nuevaTorre.save();
    await nuevaTorre.populate(populateOptions);

    res.status(201).json(nuevaTorre);
  } catch (err) {
    console.error("Error en torrePost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear la torre.",
    });
  }
};

// Controlador para actualizar una torre existente
const torrePut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await Torre.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Torre no encontrada." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const torreActualizada = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!torreActualizada) {
      return res.status(404).json({ msg: "Torre no encontrada." });
    }

    res.json(torreActualizada);
  } catch (err) {
    console.error("Error en torrePut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la torre.",
    });
  }
};

// Controlador para eliminar (marcar como eliminada) una torre
const torreDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await Torre.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Torre no encontrada." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const torreEliminada = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!torreEliminada) {
      return res.status(404).json({ msg: "Torre no encontrada." });
    }

    res.json(torreEliminada);
  } catch (err) {
    console.error("Error en torreDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la torre.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const torrePatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const torreActualizada = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!torreActualizada) {
      return res.status(404).json({ msg: "Torre no encontrada." });
    }

    res.json(torreActualizada);
  } catch (err) {
    console.error("Error en torrePatch:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar parcialmente la torre.",
    });
  }
};

// Exporta los controladores
module.exports = {
  torreGets,
  torreGet,
  torrePost,
  torrePut,
  torreDelete,
  torrePatch,
};
