// Importaciones necesarias
const { response, request } = require("express");
const TanqueBK = require("../../models/bunkering/tanqueBK"); // Importa el modelo TanqueBK

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idProducto", // Relación con el modelo ProductoBK
    select: "nombre color posicion", // Selecciona solo los campos necesarios
  },
  {
    path: "idEmbarcacion", // Relación con el modelo Embarcacion
    select: "nombre imo tipo", // Selecciona solo los campos necesarios
  },
  { path: "createdBy", select: "nombre correo" }, // Popula quién creó el tanque
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" }, // Popula historial.modificadoPor
  },
];

// Controlador para obtener todos los tanques con población de referencias
const tanqueGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo tanques no eliminados

  try {
    const [total, tanques] = await Promise.all([
      TanqueBK.countDocuments(query), // Cuenta el total de tanques
      TanqueBK.find(query).populate(populateOptions), // Obtiene los tanques con referencias pobladas
    ]);

    res.json({
      total,
      tanques,
    });
  } catch (err) {
    console.error("Error en tanqueGets:", err);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener los tanques." });
  }
};

// Controlador para obtener un tanque específico por ID
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

    res.json(tanque);
  } catch (err) {
    console.error("Error en tanqueGet:", err);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener el tanque." });
  }
};

// Controlador para crear un nuevo tanque
const tanquePost = async (req = request, res = response) => {
  const {
    nombre,
    capacidad,
    almacenamiento,
    ubicacion,
    almacenamientoMateriaPrimaria,
    idProducto,
    idEmbarcacion,
    idChequeoCalidad,
    idChequeoCantidad,
  } = req.body;

  try {
    // Crear el nuevo tanque
    const nuevoTanque = new TanqueBK({
      nombre,
      capacidad,
      almacenamiento,
      ubicacion,
      almacenamientoMateriaPrimaria,
      idProducto,
      idEmbarcacion,
      idChequeoCalidad,
      idChequeoCantidad,
      createdBy: req.usuario._id, // Auditoría: quién crea
    });

    // Guardar el tanque en la base de datos
    await nuevoTanque.save();

    // Agregar el ID del tanque al arreglo `tanques` de la embarcación
    if (idEmbarcacion) {
      const Embarcacion = require("../../models/bunkering/embarcacion"); // Importar el modelo Embarcacion
      await Embarcacion.findByIdAndUpdate(
        idEmbarcacion,
        { $push: { tanques: nuevoTanque._id } }, // Agregar el ID del tanque al arreglo `tanques`
        { new: true }
      );
    }

    // Población de referencias para la respuesta
    await nuevoTanque.populate(populateOptions);

    res.status(201).json(nuevoTanque);
  } catch (err) {
    console.error("Error en tanquePost:", err);
    res.status(400).json({
      error: "Error al crear el tanque. Verifica los datos proporcionados.",
    });
  }
};

// Controlador para actualizar un tanque existente
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

    // Actualizar el tanque con los nuevos datos
    const tanqueActualizado = await TanqueBK.findByIdAndUpdate(
      id,
      { ...resto, idEmbarcacion },
      { new: true }
    ).populate(populateOptions);

    res.json(tanqueActualizado);
  } catch (err) {
    console.error("Error en tanquePut:", err);
    res.status(400).json({
      error:
        "Error al actualizar el tanque. Verifica los datos proporcionados.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un tanque
const tanqueDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await TanqueBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Tanque no encontrado." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    // Marcar el tanque como eliminado y registrar el cambio en el historial
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

// Exporta los controladores
module.exports = {
  tanquePost,
  tanqueGet,
  tanqueGets,
  tanquePut,
  tanqueDelete,
  tanquePatch,
};
