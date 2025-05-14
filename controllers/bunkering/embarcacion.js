// Importaciones necesarias
const { response, request } = require("express");
const Embarcacion = require("../../models/bunkering/embarcacion");

// Opciones de población para referencias en las consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" }, // Popula el nombre del bunkering
  { path: "tanques", select: "nombre capacidad" }, // Popula los tanques asociados
  { path: "createdBy", select: "nombre correo" }, // Popula quién creó la embarcación
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" }, // Popula historial.modificadoPor
  },
];

// Controlador para obtener todas las embarcaciones
const embarcacionesGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo embarcaciones no eliminadas

  try {
    const [total, embarcaciones] = await Promise.all([
      Embarcacion.countDocuments(query), // Cuenta el total de embarcaciones
      Embarcacion.find(query).sort({ nombre: 1 }).populate(populateOptions), // Obtiene las embarcaciones con referencias pobladas
    ]);

    res.json({ total, embarcaciones });
  } catch (err) {
    console.error("Error en embarcacionesGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las embarcaciones.",
    });
  }
};

// Controlador para obtener una embarcación específica por ID
const embarcacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const embarcacion = await Embarcacion.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!embarcacion) {
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    res.json(embarcacion);
  } catch (err) {
    console.error("Error en embarcacionGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la embarcación.",
    });
  }
};

// Controlador para crear una nueva embarcación
const embarcacionPost = async (req = request, res = response) => {
  const { idBunkering, capacidad, nombre, imo, tipo, tanques } = req.body;

  try {
    const nuevaEmbarcacion = new Embarcacion({
      idBunkering,
      capacidad,
      nombre,
      imo,
      tipo,
      tanques,
      createdBy: req.usuario._id, // Auditoría: quién crea
    });

    await nuevaEmbarcacion.save();
    await nuevaEmbarcacion.populate(populateOptions);

    res.status(201).json(nuevaEmbarcacion);
  } catch (err) {
    console.error("Error en embarcacionPost:", err);
    res.status(400).json({
      error:
        "Error al crear la embarcación. Verifica los datos proporcionados.",
    });
  }
};

// Controlador para actualizar una embarcación existente
const embarcacionPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await Embarcacion.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const embarcacionActualizada = await Embarcacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!embarcacionActualizada) {
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    res.json(embarcacionActualizada);
  } catch (err) {
    console.error("Error en embarcacionPut:", err);
    res.status(400).json({
      error:
        "Error al actualizar la embarcación. Verifica los datos proporcionados.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) una embarcación
const embarcacionDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await Embarcacion.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const embarcacionEliminada = await Embarcacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!embarcacionEliminada) {
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    res.json(embarcacionEliminada);
  } catch (err) {
    console.error("Error en embarcacionDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la embarcación.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const embarcacionPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const embarcacionActualizada = await Embarcacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!embarcacionActualizada) {
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    res.json(embarcacionActualizada);
  } catch (err) {
    console.error("Error en embarcacionPatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente la embarcación.",
    });
  }
};

// Exporta los controladores
module.exports = {
  embarcacionesGets,
  embarcacionGet,
  embarcacionPost,
  embarcacionPut,
  embarcacionDelete,
  embarcacionPatch,
};
