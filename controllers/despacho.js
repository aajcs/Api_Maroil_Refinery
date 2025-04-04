// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Despacho = require("../models/despacho"); // Modelo Despacho para interactuar con la base de datos
const Contrato = require("../models/contrato"); // Modelo Contrato para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato", // Relación con el modelo Contrato
    select: "idItems numeroContrato", // Selecciona los campos idItems y numeroContrato
    populate: {
      path: "idItems", // Relación con los ítems del contrato
      populate: [
        { path: "producto", select: "nombre" },
        { path: "idTipoProducto", select: "nombre" }, // Relación con el modelo TipoProducto
      ], // Relación con el modelo Producto
    },
  },
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
  { path: "idTanque", select: "nombre" }, // Relación con el modelo Tanque
  { path: "idLineaDespacho", select: "nombre" }, // Relación con el modelo Linea
  {
    path: "idContratoItems", // Relación con los ítems del contrato
    populate: {
      path: "producto", // Relación con el modelo Producto
      select: "nombre", // Selecciona el campo nombre
    },
  },
];

// Controlador para obtener todas las despachoes con población de referencias
const despachoGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener todas las despachoes

  try {
    const [total, despachos] = await Promise.all([
      Despacho.countDocuments(query), // Cuenta el total de despachoes
      Despacho.find(query).populate(populateOptions), // Obtiene las despachoes con referencias pobladas
    ]);

    res.json({
      total,
      despachos,
    });
  } catch (err) {
    console.log(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener una recepción específica por ID
const despachoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL

  try {
    const despachoActualizada = await Despacho.findById(id).populate(
      populateOptions
    ); // Busca la recepción por ID y la popula
    if (despachoActualizada) {
      res.json(despachoActualizada); // Responde con los datos de la recepción
    } else {
      res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear una nueva recepción
const despachoPost = async (req, res = response) => {
  const {
    idContrato,
    idContratoItems,
    idLineaDespacho,
    idRefineria,
    idTanque,
    cantidadRecibida,
    cantidadEnviada,
    estadoCarga,
    estadoDespacho,
    estado,
    fechaSalida,
    fechaLlegada,
    fechaInicio,
    fechaFin,
    fechaDespacho,
    fechaInicioDespacho,
    fechaFinDespacho,
    idGuia,
    placa,
    tipo,
    nombreChofer,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  const nuevaDespacho = new Despacho({
    idContrato,
    idContratoItems,
    idLineaDespacho,
    idRefineria,
    idTanque,
    cantidadRecibida,
    cantidadEnviada,
    estadoDespacho,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioDespacho,
    fechaFinDespacho,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    idGuia,
    placa,
    tipo,
    nombreChofer,
  });

  try {
    await nuevaDespacho.save(); // Guarda la nueva recepción en la base de datos

    await nuevaDespacho.populate(populateOptions); // Poblar referencias después de guardar

    res.json({ despacho: nuevaDespacho }); // Responde con la recepción creada
  } catch (err) {
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar una recepción existente
const despachoPut = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const despachoActualizada = await Despacho.findByIdAndUpdate(id, resto, {
      new: true,
    }).populate(populateOptions); // Actualiza la recepción y popula las referencias

    if (!despachoActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }
    req.io.emit("despacho-modificada", despachoActualizada); // Emite un evento de WebSocket para notificar la modificación
    res.json(despachoActualizada); // Responde con los datos de la recepción actualizada
  } catch (err) {
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) una recepción
const despachoDelete = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL

  try {
    const despacho = await Despacho.findByIdAndUpdate(
      id,
      { eliminado: true }, // Marca la recepción como eliminada
      { new: true }
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!despacho) {
      return res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }

    res.json(despacho); // Responde con los datos de la recepción eliminada
  } catch (err) {
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const despachoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  despachoPost, // Crear una nueva recepción
  despachoGet, // Obtener una recepción específica por ID
  despachoGets, // Obtener todas las despachoes
  despachoPut, // Actualizar una recepción existente
  despachoDelete, // Eliminar (marcar como eliminado) una recepción
  despachoPatch, // Manejar solicitudes PATCH
};
