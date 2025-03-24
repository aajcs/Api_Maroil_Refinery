// Importación del modelo Torre
const Torre = require("../models/torre"); // Modelo Torre para interactuar con la base de datos

// Opciones de población para referencias en las consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Población del campo idRefineria, seleccionando solo el nombre
  { path: "material.idProducto", select: "nombre posicion color" }, // Población del campo material.idProducto, seleccionando nombre, posición y color
];

// Controlador para obtener todas las torres con paginación y población de referencias
const torreGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo torres no eliminadas

  try {
    // Ejecuta ambas consultas en paralelo para optimizar el tiempo de respuesta
    const [total, torres] = await Promise.all([
      Torre.countDocuments(query), // Cuenta el total de torres no eliminadas
      Torre.find(query).populate(populateOptions), // Obtiene las torres no eliminadas con las referencias pobladas
    ]);

    // Responde con el total de torres y la lista de torres
    res.json({
      total,
      torres,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener una torre específica por ID
const torreGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la torre desde los parámetros de la URL

  try {
    // Busca la torre por ID y verifica que no esté marcada como eliminada
    const torre = await Torre.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions); // Población de referencias

    if (!torre) {
      return res.status(404).json({ msg: "Torre no encontrada" }); // Responde con un error 404 si no se encuentra la torre
    }

    res.json(torre); // Responde con los datos de la torre
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear una nueva torre
const torrePost = async (req = request, res = response) => {
  // Extrae los datos del cuerpo de la solicitud
  const {
    idRefineria,
    almacenamiento,
    capacidad,
    material,
    numero,
    nombre,
    ubicacion,
  } = req.body;

  try {
    // Crea una nueva instancia del modelo Torre con los datos proporcionados
    const nuevaTorre = new Torre({
      idRefineria,
      almacenamiento,
      capacidad,
      material,
      numero,
      nombre,
      ubicacion,
    });

    await nuevaTorre.save(); // Guarda la nueva torre en la base de datos

    await nuevaTorre.populate(populateOptions); // Población de referencias para la respuesta

    res.status(201).json(nuevaTorre); // Responde con un código 201 (creado) y los datos de la torre
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar una torre existente
const torrePut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la torre desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    // Actualiza la torre en la base de datos y devuelve la torre actualizada
    const torreActualizada = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la torre no eliminada
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Población de referencias

    if (!torreActualizada) {
      return res.status(404).json({ msg: "Torre no encontrada" }); // Responde con un error 404 si no se encuentra la torre
    }

    res.json(torreActualizada); // Responde con los datos de la torre actualizada
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) una torre
const torreDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la torre desde los parámetros de la URL

  try {
    // Marca la torre como eliminada (eliminación lógica)
    const torre = await Torre.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la torre no eliminada
      { eliminado: true }, // Marca la torre como eliminada
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Población de referencias

    if (!torre) {
      return res.status(404).json({ msg: "Torre no encontrada" }); // Responde con un error 404 si no se encuentra la torre
    }

    res.json(torre); // Responde con los datos de la torre eliminada
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const torrePatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - torrePatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  torrePost, // Crear una nueva torre
  torreGet, // Obtener una torre específica por ID
  torreGets, // Obtener todas las torres
  torrePut, // Actualizar una torre existente
  torreDelete, // Eliminar (marcar como eliminado) una torre
  torrePatch, // Manejar solicitudes PATCH
};
