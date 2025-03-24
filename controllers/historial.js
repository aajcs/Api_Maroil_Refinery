// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Historial = require("../models/historial"); // Modelo Historial para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria, seleccionando solo el campo "nombre"
  { path: "idRefinacion", select: "operador" }, // Relación con el modelo Refinacion, seleccionando solo el campo "operador"
];

// Controlador para obtener todos los historiales con población de referencias
const historialGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false }; // Filtro para obtener solo historiales activos y no eliminados

  try {
    const [total, historials] = await Promise.all([
      Historial.countDocuments(query), // Cuenta el total de historiales
      Historial.find(query).populate(populateOptions), // Obtiene los historiales con referencias pobladas
    ]);

    if (historials.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron historials con los criterios proporcionados.",
      }); // Responde con un error 404 si no se encuentran historiales
    }

    res.json({ total, historials }); // Responde con el total y la lista de historiales
  } catch (err) {
    console.error("Error en historialGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      }); // Responde con un error 400 si hay un problema con las referencias
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener los historiales.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un historial específico por ID
const historialGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del historial desde los parámetros de la URL

  try {
    const historial = await Historial.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Busca el historial por ID y popula las referencias

    if (!historial) {
      return res.status(404).json({ msg: "Historial no encontrado" }); // Responde con un error 404 si no se encuentra el historial
    }

    res.json(historial); // Responde con los datos del historial
  } catch (err) {
    console.error("Error en historialGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de historial no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener el historial.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo historial
const historialPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idRefinacion,
    operador,
    fecha,
    incidencias,
    comentarios,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevaHistorial = new Historial({
      idRefineria,
      idRefinacion,
      operador,
      fecha,
      incidencias,
      comentarios,
    });

    await nuevaHistorial.save(); // Guarda el nuevo historial en la base de datos

    await nuevaHistorial.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaHistorial); // Responde con un código 201 (creado) y los datos del historial
  } catch (err) {
    console.error("Error en historialPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de historial no válidos.",
      }); // Responde con un error 400 si los datos no son válidos
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el historial.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para actualizar un historial existente
const historialPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del historial desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const historialActualizada = await Historial.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el historial no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!historialActualizada) {
      return res.status(404).json({ msg: "Historial no encontrado" }); // Responde con un error 404 si no se encuentra el historial
    }

    res.json(historialActualizada); // Responde con los datos del historial actualizado
  } catch (err) {
    console.error("Error en historialPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de historial no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el historial.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para eliminar (marcar como eliminado) un historial
const historialDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del historial desde los parámetros de la URL

  try {
    const historial = await Historial.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el historial no eliminado
      { eliminado: true }, // Marca el historial como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!historial) {
      return res.status(404).json({ msg: "Historial no encontrado" }); // Responde con un error 404 si no se encuentra el historial
    }

    res.json(historial); // Responde con los datos del historial eliminado
  } catch (err) {
    console.error("Error en historialDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de historial no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el historial.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const historialPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - historialPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  historialGets, // Obtener todos los historiales
  historialGet, // Obtener un historial específico por ID
  historialPost, // Crear un nuevo historial
  historialPut, // Actualizar un historial existente
  historialDelete, // Eliminar (marcar como eliminado) un historial
  historialPatch, // Manejar solicitudes PATCH
};
