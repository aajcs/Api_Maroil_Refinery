// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Refineria = require("../models/refineria"); // Modelo Refineria para interactuar con la base de datos

// Controlador para obtener todas las refinerías con paginación y población de referencias
const refineriasGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo refinerías no eliminadas

  try {
    // Ejecuta ambas consultas en paralelo para optimizar el tiempo de respuesta
    const [total, refinerias] = await Promise.all([
      Refineria.countDocuments(query), // Cuenta el total de refinerías que cumplen el filtro
      Refineria.find(query), // Obtiene las refinerías que cumplen el filtro
    ]);

    // Responde con el total de refinerías y la lista obtenida
    res.json({
      total,
      refinerias,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener una refinería específica por ID
const refineriasGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la refinería desde los parámetros de la URL

  try {
    // Busca la refinería por ID y verifica que no esté marcada como eliminada
    const refineria = await Refineria.findOne({
      _id: id,
      eliminado: false,
    });
    // .populate({
    //   path: "idContacto",
    //   select: "nombre",
    // })
    // .populate({
    //   path: "idLinea",
    //   select: "nombre",
    // });

    if (!refineria) {
      return res.status(404).json({ msg: "Refinería no encontrada" }); // Responde con un error 404 si no se encuentra la refinería
    }

    res.json(refineria); // Responde con los datos de la refinería
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear una nueva refinería
const refineriasPost = async (req = request, res = response) => {
  // Extrae los datos del cuerpo de la solicitud
  const {
    ubicacion,
    nombre,
    nit,
    img,
    idContacto,
    idLinea,
    capacidadMaxima,
    capacidadPromedio,
  } = req.body;

  try {
    // Crea una nueva instancia del modelo Refineria con los datos proporcionados
    const nuevaRefineria = new Refineria({
      ubicacion,
      capacidadMaxima,
      capacidadPromedio,
      nombre,
      nit,
      img,
      idContacto,
      idLinea,
    });

    await nuevaRefineria.save(); // Guarda la nueva refinería en la base de datos

    res.status(201).json(nuevaRefineria); // Responde con un código 201 (creado) y los datos de la refinería
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar una refinería existente
const refineriasPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la refinería desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    // Actualiza la refinería en la base de datos y devuelve la refinería actualizada
    const refineriaActualizada = await Refineria.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la refinería no eliminada
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    );

    if (!refineriaActualizada) {
      return res.status(404).json({ msg: "Refinería no encontrada" }); // Responde con un error 404 si no se encuentra la refinería
    }

    req.io.emit("refineria-modificada", refineriaActualizada); // Emite un evento de WebSocket para notificar la modificación
    res.json(refineriaActualizada); // Responde con los datos de la refinería actualizada
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) una refinería
const refineriasDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la refinería desde los parámetros de la URL

  try {
    // Marca la refinería como eliminada (eliminación lógica)
    const refineria = await Refineria.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la refinería no eliminada
      { eliminado: true }, // Marca la refinería como eliminada
      { new: true } // Devuelve el documento actualizado
    );

    if (!refineria) {
      return res.status(404).json({ msg: "Refinería no encontrada" }); // Responde con un error 404 si no se encuentra la refinería
    }

    res.json(refineria); // Responde con los datos de la refinería eliminada
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const refineriasPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refineriasPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  refineriasPost, // Crear una nueva refinería
  refineriasGet, // Obtener una refinería específica por ID
  refineriasGets, // Obtener todas las refinerías
  refineriasPut, // Actualizar una refinería existente
  refineriasDelete, // Eliminar (marcar como eliminado) una refinería
  refineriasPatch, // Manejar solicitudes PATCH
};
