// Importaciones necesarias
const { response, request } = require("express");
const SubPartida = require("../models/subPartida");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  { path: "idPartida" },
];

// Controlador para obtener todas las subpartidas
const subPartidaGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo las subpartidas no eliminadas

  try {
    const [total, subPartidas] = await Promise.all([
      SubPartida.countDocuments(query), // Cuenta el total de subpartidas
      SubPartida.find(query).populate(populateOptions), // Aplica las opciones de población
    ]);

    res.json({ total, subPartidas }); // Responde con el total y la lista de subpartidas
  } catch (err) {
    console.error("Error en subPartidaGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las subpartidas.",
    });
  }
};

// Controlador para obtener una subpartida específica por ID
const subPartidaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const subPartida = await SubPartida.findById(id).populate(populateOptions); // Aplica las opciones de población

    if (!subPartida) {
      return res.status(404).json({
        msg: "Subpartida no encontrada",
      });
    }

    res.json(subPartida); // Responde con los datos de la subpartida
  } catch (err) {
    console.error("Error en subPartidaGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de subpartida no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la subpartida.",
    });
  }
};

// Controlador para crear una nueva subpartida
const subPartidaPost = async (req = request, res = response) => {
  const { idRefineria, idPartida, descripcion, codigo } = req.body;

  try {
    const nuevaSubPartida = new SubPartida({
      idRefineria,
      idPartida,
      descripcion,
      codigo,
    });

    await nuevaSubPartida.save(); // Guarda la nueva subpartida en la base de datos

    // Población de los campos relacionados utilizando populateOptions
    const subPartidaPopulada = await SubPartida.findById(
      nuevaSubPartida._id
    ).populate(populateOptions);

    res.status(201).json(subPartidaPopulada); // Responde con un código 201 (creado) y los datos de la subpartida populada
  } catch (err) {
    console.error("Error en subPartidaPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de subpartida no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la subpartida.",
    });
  }
};

// Controlador para actualizar una línea de carga existente
const subPartidaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body; // Excluye el campo _id del cuerpo de la solicitud

  try {
    const subPartidaActualizada = await SubPartida.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la subPartida no eliminada
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!subPartidaActualizada) {
      return res.status(404).json({
        msg: "Sub Partida no encontrada",
      });
    }

    res.json(subPartidaActualizada); // Responde con los datos de la subPartida actualizada
  } catch (err) {
    console.error("Error en subPartidaPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de subPartida no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la subPartida.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const subPartidaPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body; // Excluye el campo _id del cuerpo de la solicitud

  try {
    const subPartidaActualizada = await SubPartida.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la subpartida no eliminada
      { $set: resto }, // Actualiza solo los campos proporcionados
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!subPartidaActualizada) {
      return res.status(404).json({
        msg: "Subpartida no encontrada",
      });
    }

    res.json(subPartidaActualizada); // Responde con los datos de la subpartida actualizada
  } catch (err) {
    console.error("Error en subPartidaPatch:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de subpartida no válido.",
      });
    }

    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente la subpartida.",
    });
  }
};

// Controlador para eliminar (marcar como eliminada) una subpartida
const subPartidaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const subPartida = await SubPartida.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la subpartida no eliminada
      { eliminado: true }, // Marca la subpartida como eliminada
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!subPartida) {
      return res.status(404).json({
        msg: "Subpartida no encontrada",
      });
    }

    res.json(subPartida); // Responde con los datos de la subpartida eliminada
  } catch (err) {
    console.error("Error en subPartidaDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de subpartida no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la subpartida.",
    });
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  subPartidaGets, // Obtener todas las subpartidas
  subPartidaGet, // Obtener una subpartida específica por ID
  subPartidaPost, // Crear una nueva subpartida
  subPartidaPut, // Actualizar una subpartida existente
  subPartidaPatch, // Actualizar parcialmente una subpartida
  subPartidaDelete, // Eliminar (marcar como eliminada) una subpartida
};
