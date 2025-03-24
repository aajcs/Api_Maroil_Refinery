// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const LineaCarga = require("../models/lineaCarga"); // Modelo LineaCarga para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [{ path: "idRefineria", select: "nombre" }]; // Relación con el modelo Refineria, seleccionando solo el campo "nombre"

// Controlador para obtener todas las líneas de carga con población de referencias
const lineaCargaGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo líneas de carga no eliminadas

  try {
    const [total, lineaCargas] = await Promise.all([
      LineaCarga.countDocuments(query), // Cuenta el total de líneas de carga
      LineaCarga.find(query).populate(populateOptions), // Obtiene las líneas de carga con referencias pobladas
    ]);

    res.json({
      total,
      lineaCargas,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener una línea de carga específica por ID
const lineaCargaGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la línea de carga desde los parámetros de la URL

  try {
    const lineaCarga = await LineaCarga.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions); // Busca la línea de carga por ID y popula las referencias

    if (!lineaCarga) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" }); // Responde con un error 404 si no se encuentra la línea de carga
    }

    res.json(lineaCarga); // Responde con los datos de la línea de carga
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear una nueva línea de carga
const lineaCargaPost = async (req = request, res = response) => {
  const { ubicacion, nombre, idRefineria, tipoLinea } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevaLineaCarga = new LineaCarga({
      ubicacion,
      nombre,
      idRefineria,
      tipoLinea,
    });

    await nuevaLineaCarga.save(); // Guarda la nueva línea de carga en la base de datos

    await nuevaLineaCarga.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaLineaCarga); // Responde con un código 201 (creado) y los datos de la línea de carga
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar una línea de carga existente
const lineaCargaPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la línea de carga desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const lineaCargaActualizada = await LineaCarga.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la línea de carga no eliminada
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!lineaCargaActualizada) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" }); // Responde con un error 404 si no se encuentra la línea de carga
    }

    res.json(lineaCargaActualizada); // Responde con los datos de la línea de carga actualizada
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) una línea de carga
const lineaCargaDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la línea de carga desde los parámetros de la URL

  try {
    const lineaCarga = await LineaCarga.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la línea de carga no eliminada
      { eliminado: true }, // Marca la línea de carga como eliminada
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!lineaCarga) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" }); // Responde con un error 404 si no se encuentra la línea de carga
    }

    res.json(lineaCarga); // Responde con los datos de la línea de carga eliminada
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const lineaCargaPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - lineaCargaPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  lineaCargaPost, // Crear una nueva línea de carga
  lineaCargaGet, // Obtener una línea de carga específica por ID
  lineaCargaGets, // Obtener todas las líneas de carga
  lineaCargaPut, // Actualizar una línea de carga existente
  lineaCargaDelete, // Eliminar (marcar como eliminado) una línea de carga
  lineaCargaPatch, // Manejar solicitudes PATCH
};
