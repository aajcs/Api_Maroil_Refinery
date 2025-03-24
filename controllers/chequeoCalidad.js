// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const ChequeoCalidad = require("../models/chequeoCalidad"); // Modelo ChequeoCalidad para interactuar con la base de datos
const { Refinacion } = require("../models"); // Modelo Refinacion para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idProducto", select: "nombre" }, // Relación con el modelo Producto
  { path: "idTanque", select: "nombre" }, // Relación con el modelo Tanque
  { path: "idTorre", select: "nombre" }, // Relación con el modelo Torre
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
  { path: "idRefinacion", select: "descripcion" }, // Relación con el modelo Refinacion
];

// Controlador para obtener todos los chequeos de calidad con población de referencias
const chequeoCalidadGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo chequeos no eliminados

  try {
    const [total, chequeoCalidads] = await Promise.all([
      ChequeoCalidad.countDocuments(query), // Cuenta el total de chequeos
      ChequeoCalidad.find(query).populate(populateOptions), // Obtiene los chequeos con referencias pobladas
    ]);

    res.json({ total, chequeoCalidads }); // Responde con el total y la lista de chequeos
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un chequeo de calidad específico por ID
const chequeoCalidadGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del chequeo desde los parámetros de la URL

  try {
    const chequeoCalidad = await ChequeoCalidad.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Busca el chequeo por ID y popula las referencias

    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" }); // Responde con un error 404 si no se encuentra el chequeo
    }

    res.json(chequeoCalidad); // Responde con los datos del chequeo
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo chequeo de calidad
const chequeoCalidadPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idProducto,
    idTanque,
    idTorre,
    idRefinacion,
    operador,
    fechaChequeo,
    gravedadAPI,
    azufre,
    viscosidad,
    densidad,
    contenidoAgua,
    contenidoPlomo,
    octanaje,
    temperatura,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevoChequeoCalidad = new ChequeoCalidad({
      idRefineria,
      idProducto,
      idTanque,
      idTorre,
      idRefinacion,
      operador,
      fechaChequeo,
      gravedadAPI,
      azufre,
      viscosidad,
      densidad,
      contenidoAgua,
      contenidoPlomo,
      octanaje,
      temperatura,
    });

    await nuevoChequeoCalidad.save(); // Guarda el nuevo chequeo en la base de datos

    // Actualiza la colección de Refinacion para agregar la referencia al chequeo
    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idChequeoCalidad: nuevoChequeoCalidad._id } },
      { new: true }
    );

    await nuevoChequeoCalidad.populate(populateOptions); // Poblar referencias después de guardar
    res.status(201).json(nuevoChequeoCalidad); // Responde con un código 201 (creado) y los datos del chequeo
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message }); // Responde con un error 400 si los datos no son válidos
  }
};

// Controlador para actualizar un chequeo de calidad existente
const chequeoCalidadPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del chequeo desde los parámetros de la URL
  const { idRefinacion, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo ciertos campos

  try {
    const chequeoCalidadActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el chequeo no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!chequeoCalidadActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" }); // Responde con un error 404 si no se encuentra el chequeo
    }

    // Actualiza la referencia en la colección de Refinacion si se proporciona un nuevo idRefinacion
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idChequeoCalidad: id },
        { $pull: { idChequeoCalidad: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idChequeoCalidad: id } },
        { new: true }
      );
    }

    res.json(chequeoCalidadActualizado); // Responde con los datos del chequeo actualizado
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message }); // Responde con un error 400 si los datos no son válidos
  }
};

// Controlador para eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del chequeo desde los parámetros de la URL

  try {
    const chequeoCalidad = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el chequeo no eliminado
      { eliminado: true }, // Marca el chequeo como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" }); // Responde con un error 404 si no se encuentra el chequeo
    }

    // Elimina la referencia en la colección de Refinacion
    await Refinacion.updateMany(
      { idChequeoCalidad: id },
      { $pull: { idChequeoCalidad: id } }
    );

    res.json(chequeoCalidad); // Responde con los datos del chequeo eliminado
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const chequeoCalidadPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCalidadPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  chequeoCalidadGets, // Obtener todos los chequeos de calidad
  chequeoCalidadGet, // Obtener un chequeo de calidad específico por ID
  chequeoCalidadPost, // Crear un nuevo chequeo de calidad
  chequeoCalidadPut, // Actualizar un chequeo de calidad existente
  chequeoCalidadDelete, // Eliminar (marcar como eliminado) un chequeo de calidad
  chequeoCalidadPatch, // Manejar solicitudes PATCH
};
