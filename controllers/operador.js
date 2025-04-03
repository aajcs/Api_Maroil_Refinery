// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Operador = require("../models/operador"); // Modelo Operador para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [{ path: "idRefineria", select: "nombre" }]; // Relación con el modelo Refineria, seleccionando solo el campo "nombre"

// Controlador para obtener todos los operadores con población de referencias
const operadorGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo operadores no eliminados

  try {
    const [total, operadores] = await Promise.all([
      Operador.countDocuments(query), // Cuenta el total de operadores
      Operador.find(query).populate(populateOptions), // Obtiene los operadores con referencias pobladas
    ]);

    res.json({ total, operadores }); // Responde con el total y la lista de operadores
  } catch (err) {
    console.error("Error en operadorGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      }); // Responde con un error 400 si hay un problema con las referencias
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener los operadores.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un operador específico por ID
const operadorGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del operador desde los parámetros de la URL

  try {
    const operador = await Operador.findOne({
      _id: id,
      estado: "Activo",
      eliminado: false,
    }).populate(populateOptions); // Busca el operador por ID y popula las referencias

    if (!operador) {
      return res.status(404).json({ msg: "Operador no encontrado" }); // Responde con un error 404 si no se encuentra el operador
    }

    res.json(operador); // Responde con los datos del operador
  } catch (err) {
    console.error("Error en operadorGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de operador no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener el operador.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo operador
const operadorPost = async (req = request, res = response) => {
  const { nombre, cargo, idRefineria } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevoOperador = new Operador({
      nombre,
      cargo,
      idRefineria,
    });

    await nuevoOperador.save(); // Guarda el nuevo operador en la base de datos

    await nuevoOperador.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevoOperador); // Responde con un código 201 (creado) y los datos del operador
  } catch (err) {
    console.error("Error en operadorPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de operador no válidos.",
      }); // Responde con un error 400 si los datos no son válidos
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el operador.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para actualizar un operador existente
const operadorPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del operador desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo ciertos campos

  try {
    const operadorActualizado = await Operador.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el operador no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!operadorActualizado) {
      return res.status(404).json({ msg: "Operador no encontrado" }); // Responde con un error 404 si no se encuentra el operador
    }

    res.json(operadorActualizado); // Responde con los datos del operador actualizado
  } catch (err) {
    console.error("Error en operadorPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de operador no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el operador.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para eliminar (marcar como eliminado) un operador
const operadorDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del operador desde los parámetros de la URL

  try {
    const operador = await Operador.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el operador no eliminado
      { eliminado: true }, // Marca el operador como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!operador) {
      return res.status(404).json({ msg: "Operador no encontrado" }); // Responde con un error 404 si no se encuentra el operador
    }

    res.json(operador); // Responde con los datos del operador eliminado
  } catch (err) {
    console.error("Error en operadorDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de operador no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el operador.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const operadorPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - operadorPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  operadorGets, // Obtener todos los operadores
  operadorGet, // Obtener un operador específico por ID
  operadorPost, // Crear un nuevo operador
  operadorPut, // Actualizar un operador existente
  operadorDelete, // Eliminar (marcar como eliminado) un operador
  operadorPatch, // Manejar solicitudes PATCH
};