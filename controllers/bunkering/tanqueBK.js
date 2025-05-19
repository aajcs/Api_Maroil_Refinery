const { response, request } = require("express");
const TanqueBK = require("../../models/bunkering/tanqueBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idProducto",
    select: "nombre color posicion",
  },
  {
    path: "idEmbarcacion",
    select: "nombre imo tipo",
  },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todos los tanques con historial ordenado
const tanqueGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, tanques] = await Promise.all([
      TanqueBK.countDocuments(query),
      TanqueBK.find(query).populate(populateOptions),
    ]);

    // Ordenar historial por fecha descendente en cada tanque
    tanques.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, tanques });
  } catch (err) {
    console.error("Error en tanqueGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los tanques.",
    });
  }
};

// Obtener un tanque específico por ID
const tanqueGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const tanque = await TanqueBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!tanque) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    // Ordenar historial por fecha descendente
    if (Array.isArray(tanque.historial)) {
      tanque.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    res.json(tanque);
  } catch (err) {
    console.error("Error en tanqueGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el tanque.",
    });
  }
};

// Crear un nuevo tanque
const tanquePost = async (req = request, res = response) => {
  const {
    nombre,
    capacidad,
    almacenamiento,
    ubicacion,
    idProducto,
    idEmbarcacion,
    idChequeoCalidad,
    idChequeoCantidad,
    idBunkering,
  } = req.body;

  try {
    const nuevoTanque = new TanqueBK({
      nombre,
      capacidad,
      almacenamiento,
      ubicacion,
      idProducto,
      idEmbarcacion,
      idChequeoCalidad,
      idChequeoCantidad,
      idBunkering,
      createdBy: req.usuario._id,
    });

    await nuevoTanque.save();

    // Agregar el ID del tanque al arreglo `tanques` de la embarcación
    if (idEmbarcacion) {
      const Embarcacion = require("../../models/bunkering/embarcacion");
      await Embarcacion.findByIdAndUpdate(
        idEmbarcacion,
        { $push: { tanques: nuevoTanque._id } },
        { new: true }
      );
    }

    await nuevoTanque.populate(populateOptions);

    res.status(201).json(nuevoTanque);
  } catch (err) {
    console.error("Error en tanquePost:", err);
    res.status(400).json({
      error: "Error al crear el tanque. Verifica los datos proporcionados.",
    });
  }
};

// Actualizar un tanque existente con historial de modificaciones
const tanquePut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, idEmbarcacion, ...resto } = req.body;

  try {
    const tanqueAnterior = await TanqueBK.findById(id);
    if (!tanqueAnterior) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    // Si el idEmbarcacion cambia, actualiza el arreglo `tanques` en las embarcaciones
    if (
      idEmbarcacion &&
      String(tanqueAnterior.idEmbarcacion) !== idEmbarcacion
    ) {
      const Embarcacion = require("../../models/bunkering/embarcacion");

      // Remover el tanque del arreglo `tanques` de la embarcación anterior
      await Embarcacion.findByIdAndUpdate(tanqueAnterior.idEmbarcacion, {
        $pull: { tanques: tanqueAnterior._id },
      });

      // Agregar el tanque al arreglo `tanques` de la nueva embarcación
      await Embarcacion.findByIdAndUpdate(idEmbarcacion, {
        $push: { tanques: tanqueAnterior._id },
      });
    }

    // Auditoría: detectar cambios
    const cambios = {};
    for (let key in resto) {
      if (String(tanqueAnterior[key]) !== String(resto[key])) {
        cambios[key] = { from: tanqueAnterior[key], to: resto[key] };
      }
    }

    // Actualizar el tanque y registrar el historial
    const tanqueActualizado = await TanqueBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        idEmbarcacion,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!tanqueActualizado) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    res.json(tanqueActualizado);
  } catch (err) {
    console.error("Error en tanquePut:", err);
    res.status(400).json({
      error:
        "Error al actualizar el tanque. Verifica los datos proporcionados.",
    });
  }
};

// Eliminar (marcar como eliminado) un tanque con historial de auditoría
const tanqueDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await TanqueBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const tanqueEliminado = await TanqueBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!tanqueEliminado) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    res.json(tanqueEliminado);
  } catch (err) {
    console.error("Error en tanqueDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el tanque.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const tanquePatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const tanqueActualizado = await TanqueBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!tanqueActualizado) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    res.json(tanqueActualizado);
  } catch (err) {
    console.error("Error en tanquePatch:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar parcialmente el tanque.",
    });
  }
};

module.exports = {
  tanquePost,
  tanqueGet,
  tanqueGets,
  tanquePut,
  tanqueDelete,
  tanquePatch,
};
