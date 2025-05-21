// Importaciones necesarias
const { response, request } = require("express");
const { Muelle } = require("../../models");

// Opciones de población para referencias en las consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Controlador para obtener todos los muelle con paginación y población de referencias
const muelleGets = async (req = request, res = response) => {
  const query = { eliminado: false };
  try {
    const [total, muelles] = await Promise.all([
      Muelle.countDocuments(query),
      Muelle.find(query).sort({ nombre: 1 }).populate(populateOptions),
    ]);

    // Ordenar historial por fecha descendente en cada muelles
    muelles.forEach((m) => {
      if (Array.isArray(m.historial)) {
        m.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, muelles });
  } catch (err) {
    console.error("Error en muelleGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los muelle.",
    });
  }
};

// Controlador para obtener un muelle específico por ID
const muelleGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const muelle = await Muelle.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!muelle) {
      return res.status(404).json({ msg: "Muelle no encontrado." });
    }

    // Ordenar historial por fecha descendente
    if (Array.isArray(muelle.historial)) {
      muelle.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    res.json(muelle);
  } catch (err) {
    console.error("Error en muelleGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el muelle.",
    });
  }
};

// Controlador para crear un nuevo muelle
const muellePost = async (req = request, res = response) => {
  const {
    ubicacion,
    correo,
    telefono,
    nombre,
    nit,
    legal,
    img,
    estado,
    idBunkering,
  } = req.body;

  try {
    const nuevoMuelle = new Muelle({
      ubicacion,
      correo,
      telefono,
      nombre,
      nit,
      legal,
      img,
      idBunkering,
      estado,
      createdBy: req.usuario._id,
    });

    await nuevoMuelle.save();
    await nuevoMuelle.populate(populateOptions);

    res.status(201).json(nuevoMuelle);
  } catch (err) {
    console.error("Error en muellePost:", err);
    res.status(400).json({
      error: "Error al crear el muelle. Verifica los datos proporcionados.",
    });
  }
};

// Controlador para actualizar un muelle existente
const muellePut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await Muelle.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Muelle no encontrado." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const muelleActualizado = await Muelle.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!muelleActualizado) {
      return res.status(404).json({ msg: "Muelle no encontrado." });
    }

    res.json(muelleActualizado);
  } catch (err) {
    console.error("Error en muellePut:", err);
    res.status(400).json({
      error:
        "Error al actualizar el muelle. Verifica los datos proporcionados.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un muelle
const muelleDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await Muelle.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Muelle no encontrado." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const muelleEliminado = await Muelle.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!muelleEliminado) {
      return res.status(404).json({ msg: "Muelle no encontrado." });
    }

    res.json(muelleEliminado);
  } catch (err) {
    console.error("Error en muelleDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el muelle.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const muellePatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const muelleActualizado = await Muelle.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!muelleActualizado) {
      return res.status(404).json({ msg: "Muelle no encontrado." });
    }

    res.json(muelleActualizado);
  } catch (err) {
    console.error("Error en muellePatch:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar parcialmente el muelle.",
    });
  }
};

// Exporta los controladores
module.exports = {
  muelleGets,
  muelleGet,
  muellePost,
  muellePut,
  muelleDelete,
  muellePatch,
};
