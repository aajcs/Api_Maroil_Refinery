const { response, request } = require("express");
const Embarcacion = require("../../models/bunkering/embarcacion");
const TanqueBK = require("../../models/bunkering/tanqueBK");

// Opciones de población para referencias en las consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  { path: "tanques", select: "nombre capacidad" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todas las embarcaciones
const embarcacionesGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, embarcacions] = await Promise.all([
      Embarcacion.countDocuments(query),
      Embarcacion.find(query).sort({ nombre: 1 }).populate(populateOptions),
    ]);
    embarcacions.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({ total, embarcacions });
  } catch (err) {
    console.error("Error en embarcacionesGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las embarcaciones.",
    });
  }
};

// Obtener una embarcación específica por ID
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

    // Ordenar historial por fecha descendente
    if (Array.isArray(embarcacion.historial)) {
      embarcacion.historial.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
    }

    res.json(embarcacion);
  } catch (err) {
    console.error("Error en embarcacionGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la embarcación.",
    });
  }
};

// Crear una nueva embarcación y sus tanques asociados (con rollback si hay error en tanques)
const embarcacionPost = async (req = request, res = response) => {
  const { idBunkering, capacidad, nombre, imo, tipo, tanques } = req.body;

  // Usar una sesión de mongoose para transacción
  const session = await Embarcacion.startSession();
  session.startTransaction();

  try {
    // 1. Crear la embarcación sin tanques aún
    const nuevaEmbarcacion = new Embarcacion({
      idBunkering,
      capacidad,
      nombre,
      imo,
      tipo,
      createdBy: req.usuario._id,
    });

    await nuevaEmbarcacion.save({ session });

    // 2. Si se envía un array de tanques, crearlos y asociarlos
    let tanquesIds = [];
    if (Array.isArray(tanques) && tanques.length > 0) {
      for (const tanqueData of tanques) {
        const nuevoTanque = new TanqueBK({
          ...tanqueData,
          idEmbarcacion: nuevaEmbarcacion._id,
          createdBy: req.usuario._id,
        });
        try {
          await nuevoTanque.save({ session });
          tanquesIds.push(nuevoTanque._id);
        } catch (tanqueErr) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            error: `Error al crear el tanque "${tanqueData.nombre}": ${tanqueErr.message}`,
          });
        }
      }
      // Asociar los tanques creados a la embarcación
      nuevaEmbarcacion.tanques = tanquesIds;
      await nuevaEmbarcacion.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    await nuevaEmbarcacion.populate(populateOptions);

    res.status(201).json(nuevaEmbarcacion);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error en embarcacionPost:", err);
    res.status(400).json({
      error:
        "Error al crear la embarcación y sus tanques. Verifica los datos proporcionados.",
    });
  }
};

// Actualizar una embarcación existente y permitir crear tanques nuevos (con rollback si hay error en tanques)
const embarcacionPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, tanques, ...resto } = req.body;

  // Usar una sesión de mongoose para transacción
  const session = await Embarcacion.startSession();
  session.startTransaction();

  try {
    const antes = await Embarcacion.findById(id).session(session);
    if (!antes) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    // Si se envía un array de tanques, crear los nuevos tanques y asociarlos
    let tanquesIds = antes.tanques ? [...antes.tanques] : [];
    if (Array.isArray(tanques) && tanques.length > 0) {
      for (const tanqueData of tanques) {
        // Si el tanque ya tiene _id, no lo crees de nuevo
        if (!tanqueData._id) {
          const nuevoTanque = new TanqueBK({
            ...tanqueData,
            idEmbarcacion: id,
            createdBy: req.usuario._id,
          });
          try {
            await nuevoTanque.save({ session });
            tanquesIds.push(nuevoTanque._id);
          } catch (tanqueErr) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              error: `Error al crear el tanque "${tanqueData.nombre}": ${tanqueErr.message}`,
            });
          }
        } else if (!tanquesIds.includes(tanqueData._id)) {
          tanquesIds.push(tanqueData._id);
        }
      }
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }
    // Detectar cambios en tanques (solo si hay nuevos tanques)
    if (Array.isArray(tanques) && tanques.length > 0) {
      cambios.tanques = { from: antes.tanques, to: tanquesIds };
    }

    const embarcacionActualizada = await Embarcacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        tanques: tanquesIds,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true, session }
    ).populate(populateOptions);

    if (!embarcacionActualizada) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Embarcación no encontrada." });
    }

    await session.commitTransaction();
    session.endSession();

    res.json(embarcacionActualizada);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error en embarcacionPut:", err);
    res.status(400).json({
      error:
        "Error al actualizar la embarcación y sus tanques. Verifica los datos proporcionados.",
    });
  }
};

// Eliminar (marcar como eliminado) una embarcación con historial de auditoría
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

module.exports = {
  embarcacionesGets,
  embarcacionGet,
  embarcacionPost,
  embarcacionPut,
  embarcacionDelete,
  embarcacionPatch,
};
