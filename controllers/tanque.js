// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Tanque = require("../models/tanque"); // Modelo Tanque para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idRefineria", // Relación con el modelo Refineria
    select: "nombre", // Selecciona solo el campo nombre
  },
  {
    path: "idProducto", // Relación con el modelo Producto
    select: "nombre color", // Selecciona solo los campos nombre y color
  },
];

// Controlador para obtener todos los tanques con paginación y población de referencias
const tanqueGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo tanques no eliminados

  try {
    // Ejecuta ambas consultas en paralelo para optimizar el tiempo de respuesta
    const [total, tanques] = await Promise.all([
      Tanque.countDocuments(query), // Cuenta el total de tanques que cumplen el filtro
      Tanque.find(query).populate(populateOptions), // Obtiene los tanques con las referencias pobladas
    ]);

    // Responde con el total de tanques y la lista obtenida
    res.json({
      total,
      tanques,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener un tanque específico por ID
const tanqueGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del tanque desde los parámetros de la URL

  try {
    // Busca el tanque por ID y verifica que no esté marcado como eliminado
    const tanque = await Tanque.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions); // Población de referencias

    if (!tanque) {
      return res.status(404).json({ msg: "Tanque no encontrado" }); // Responde con un error 404 si no se encuentra el tanque
    }

    res.json(tanque); // Responde con los datos del tanque
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear un nuevo tanque
const tanquePost = async (req = request, res = response) => {
  // Extrae los datos del cuerpo de la solicitud
  const {
    nombre,
    ubicacion,
    capacidad,
    almacenamiento,
    almacenamientoMateriaPrimaria,
    idRefineria,
    idProducto,
  } = req.body;

  try {
    // Crea una nueva instancia del modelo Tanque con los datos proporcionados
    const nuevoTanque = new Tanque({
      nombre,
      ubicacion,
      capacidad,
      almacenamiento,
      almacenamientoMateriaPrimaria,
      idRefineria,
      idProducto,
    });

    await nuevoTanque.save(); // Guarda el nuevo tanque en la base de datos

    await nuevoTanque.populate(populateOptions); // Población de referencias para la respuesta

    res.status(201).json(nuevoTanque); // Responde con un código 201 (creado) y los datos del tanque
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar un tanque existente
const tanquePut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del tanque desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    // Actualiza el tanque en la base de datos y devuelve el tanque actualizado
    const tanqueActualizado = await Tanque.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el tanque no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Población de referencias

    if (!tanqueActualizado) {
      return res.status(404).json({ msg: "Tanque no encontrado" }); // Responde con un error 404 si no se encuentra el tanque
    }

    res.json(tanqueActualizado); // Responde con los datos del tanque actualizado
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) un tanque
const tanqueDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del tanque desde los parámetros de la URL

  try {
    // Marca el tanque como eliminado (eliminación lógica)
    const tanque = await Tanque.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el tanque no eliminado
      { eliminado: true }, // Marca el tanque como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Población de referencias

    if (!tanque) {
      return res.status(404).json({ msg: "Tanque no encontrado" }); // Responde con un error 404 si no se encuentra el tanque
    }

    res.json(tanque); // Responde con los datos del tanque eliminado
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const tanquePatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - tanquePatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  tanquePost, // Crear un nuevo tanque
  tanqueGet, // Obtener un tanque específico por ID
  tanqueGets, // Obtener todos los tanques
  tanquePut, // Actualizar un tanque existente
  tanqueDelete, // Eliminar (marcar como eliminado) un tanque
  tanquePatch, // Manejar solicitudes PATCH
};
