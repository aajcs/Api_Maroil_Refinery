// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const ChequeoCantidad = require("../models/chequeoCantidad"); // Modelo ChequeoCantidad para interactuar con la base de datos
const { Refinacion } = require("../models"); // Modelo Refinacion para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idProducto", select: "nombre" }, // Relación con el modelo Producto
  { path: "idTanque", select: "nombre" }, // Relación con el modelo Tanque
  { path: "idTorre", select: "nombre" }, // Relación con el modelo Torre
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
  { path: "idRefinacion", select: "descripcion" }, // Relación con el modelo Refinacion
];

// Controlador para obtener todos los chequeos de cantidad con población de referencias
const chequeoCantidadGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false }; // Filtro para obtener solo chequeos activos y no eliminados

  try {
    const [total, chequeoCantidads] = await Promise.all([
      ChequeoCantidad.countDocuments(query), // Cuenta el total de chequeos
      ChequeoCantidad.find(query).populate(populateOptions), // Obtiene los chequeos con referencias pobladas
    ]);

    res.json({ total, chequeoCantidads }); // Responde con el total y la lista de chequeos
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un chequeo de cantidad específico por ID
const chequeoCantidadGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del chequeo desde los parámetros de la URL

  try {
    const chequeoCantidad = await ChequeoCantidad.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Busca el chequeo por ID y popula las referencias

    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" }); // Responde con un error 404 si no se encuentra el chequeo
    }

    res.json(chequeoCantidad); // Responde con los datos del chequeo
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo chequeo de cantidad
const chequeoCantidadPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idProducto,
    idTanque,
    idTorre,
    idRefinacion,
    operador,
    fechaChequeo,
    cantidad,
    turno,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevoChequeoCantidad = new ChequeoCantidad({
      idRefineria,
      idProducto,
      idTanque,
      idTorre,
      idRefinacion,
      operador,
      fechaChequeo,
      cantidad,
      turno,
    });

    await nuevoChequeoCantidad.save(); // Guarda el nuevo chequeo en la base de datos

    // Actualiza la colección de Refinacion para agregar la referencia al chequeo
    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idChequeoCantidad: nuevoChequeoCantidad._id } },
      { new: true }
    );

    await nuevoChequeoCantidad.populate(populateOptions); // Poblar referencias después de guardar
    res.status(201).json(nuevoChequeoCantidad); // Responde con un código 201 (creado) y los datos del chequeo
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message }); // Responde con un error 400 si los datos no son válidos
  }
};

// Controlador para actualizar un chequeo de cantidad existente
const chequeoCantidadPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del chequeo desde los parámetros de la URL
  const { idRefinacion, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo ciertos campos

  try {
    const chequeoCantidadActualizado = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el chequeo no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!chequeoCantidadActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" }); // Responde con un error 404 si no se encuentra el chequeo
    }

    // Actualiza la referencia en la colección de Refinacion si se proporciona un nuevo idRefinacion
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idChequeoCantidad: id },
        { $pull: { idChequeoCantidad: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idChequeoCantidad: id } },
        { new: true }
      );
    }

    res.json(chequeoCantidadActualizado); // Responde con los datos del chequeo actualizado
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message }); // Responde con un error 400 si los datos no son válidos
  }
};

// Controlador para eliminar (marcar como eliminado) un chequeo de cantidad
const chequeoCantidadDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del chequeo desde los parámetros de la URL

  try {
    const chequeoCantidad = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el chequeo no eliminado
      { eliminado: true }, // Marca el chequeo como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" }); // Responde con un error 404 si no se encuentra el chequeo
    }

    // Elimina la referencia en la colección de Refinacion
    await Refinacion.updateMany(
      { idChequeoCantidad: id },
      { $pull: { idChequeoCantidad: id } }
    );

    res.json(chequeoCantidad); // Responde con los datos del chequeo eliminado
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const chequeoCantidadPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCantidadPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  chequeoCantidadGets, // Obtener todos los chequeos de cantidad
  chequeoCantidadGet, // Obtener un chequeo de cantidad específico por ID
  chequeoCantidadPost, // Crear un nuevo chequeo de cantidad
  chequeoCantidadPut, // Actualizar un chequeo de cantidad existente
  chequeoCantidadDelete, // Eliminar (marcar como eliminado) un chequeo de cantidad
  chequeoCantidadPatch, // Manejar solicitudes PATCH
};
