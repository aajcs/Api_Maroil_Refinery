// Importaciones necesarias
const { response, request } = require("express");
const Partida = require("../models/partida");

// Opciones de población reutilizables
const populateOptions = [{ path: "idRefineria", select: "nombre" }];

// Controlador para obtener todas las partidas
const partidaGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo las partidas no eliminadas

  try {
    const [total, partidas] = await Promise.all([
      Partida.countDocuments(query), // Cuenta el total de partidas
      Partida.find(query).populate(populateOptions), // Aplica las opciones de población
    ]);

    res.json({ total, partidas }); // Responde con el total y la lista de partidas
  } catch (err) {
    console.error("Error en partidaGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las partidas.",
    });
  }
};

// Controlador para obtener una partida específica por ID
const partidaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const partida = await Partida.findById(id).populate(populateOptions); // Aplica las opciones de población

    if (!partida) {
      return res.status(404).json({
        msg: "Partida no encontrada",
      });
    }

    res.json(partida); // Responde con los datos de la partida
  } catch (err) {
    console.error("Error en partidaGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de partida no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la partida.",
    });
  }
};

// Controlador para crear una nueva partida
const partidaPost = async (req = request, res = response) => {
  const { idRefineria, descripcion, codigo } = req.body;

  try {
    const nuevaPartida = new Partida({
      idRefineria,
      descripcion,
      codigo,
    });

    await nuevaPartida.save(); // Guarda la nueva partida en la base de datos

    res.status(201).json(nuevaPartida); // Responde con un código 201 (creado) y los datos de la partida
  } catch (err) {
    console.error("Error en partidaPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de partida no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la partida.",
    });
  }
};

// Controlador para actualizar una partida existente
const partidaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body; // Excluye el campo _id del cuerpo de la solicitud

  try {
    const partidaActualizada = await Partida.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la partida no eliminada
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!partidaActualizada) {
      return res.status(404).json({
        msg: "Partida no encontrada",
      });
    }

    res.json(partidaActualizada); // Responde con los datos de la partida actualizada
  } catch (err) {
    console.error("Error en partidaPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de partida no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la partida.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const partidaPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body; // Excluye el campo _id del cuerpo de la solicitud

  try {
    const partidaActualizada = await Partida.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la partida no eliminada
      { $set: resto }, // Actualiza solo los campos proporcionados
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!partidaActualizada) {
      return res.status(404).json({
        msg: "Partida no encontrada",
      });
    }

    res.json(partidaActualizada); // Responde con los datos de la partida actualizada
  } catch (err) {
    console.error("Error en partidaPatch:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de partida no válido.",
      });
    }

    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente la partida.",
    });
  }
};

// Controlador para eliminar (marcar como eliminada) una partida
const partidaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const partida = await Partida.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la partida no eliminada
      { eliminado: true }, // Marca la partida como eliminada
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!partida) {
      return res.status(404).json({
        msg: "Partida no encontrada",
      });
    }

    res.json(partida); // Responde con los datos de la partida eliminada
  } catch (err) {
    console.error("Error en partidaDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de partida no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la partida.",
    });
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  partidaGets, // Obtener todas las partidas
  partidaGet, // Obtener una partida específica por ID
  partidaPost, // Crear una nueva partida
  partidaPut, // Actualizar una partida existente
  partidaPatch, // Actualizar parcialmente una partida
  partidaDelete, // Eliminar (marcar como eliminada) una partida
};
