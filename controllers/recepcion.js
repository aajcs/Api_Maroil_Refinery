// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Recepcion = require("../models/recepcion"); // Modelo Recepcion para interactuar con la base de datos
const Contrato = require("../models/contrato"); // Modelo Contrato para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato", // Relación con el modelo Contrato
    select: "idItems numeroContrato", // Selecciona los campos idItems y numeroContrato
    populate: {
      path: "idItems", // Relación con los ítems del contrato
      populate: [{ path: "producto", select: "nombre" }], // Relación con el modelo Producto
    },
  },
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
  { path: "idTanque", select: "nombre" }, // Relación con el modelo Tanque
  { path: "idLinea", select: "nombre" }, // Relación con el modelo Linea
  {
    path: "idContratoItems", // Relación con los ítems del contrato
    populate: {
      path: "producto", // Relación con el modelo Producto
      select: "nombre", // Selecciona el campo nombre
    },
  },
];

// Controlador para obtener todas las recepciones con población de referencias
const recepcionGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener todas las recepciones

  try {
    const [total, recepcions] = await Promise.all([
      Recepcion.countDocuments(query), // Cuenta el total de recepciones
      Recepcion.find(query).populate(populateOptions), // Obtiene las recepciones con referencias pobladas
    ]);

    res.json({
      total,
      recepcions,
    });
  } catch (err) {
    console.log(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener una recepción específica por ID
const recepcionGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL

  try {
    const recepcionActualizada = await Recepcion.findById(id).populate(
      populateOptions
    ); // Busca la recepción por ID y la popula
    if (recepcionActualizada) {
      res.json(recepcionActualizada); // Responde con los datos de la recepción
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
const recepcionPost = async (req, res = response) => {
  const {
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,
    cantidadRecibida,
    cantidadEnviada,
    estadoRecepcion,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioRecepcion,
    fechaFinRecepcion,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    idGuia,
    placa,
    tipo,
    nombreChofer,
    apellidoChofer,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  const nuevaRecepcion = new Recepcion({
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,
    cantidadRecibida,
    cantidadEnviada,
    estadoRecepcion,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioRecepcion,
    fechaFinRecepcion,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    idGuia,
    placa,
    tipo,
    nombreChofer,
    apellidoChofer,
  });

  try {
    await nuevaRecepcion.save(); // Guarda la nueva recepción en la base de datos

    await nuevaRecepcion.populate(populateOptions); // Poblar referencias después de guardar

    res.json({ recepcion: nuevaRecepcion }); // Responde con la recepción creada
  } catch (err) {
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar una recepción existente
const recepcionPut = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const recepcionActualizada = await Recepcion.findByIdAndUpdate(id, resto, {
      new: true,
    }).populate(populateOptions); // Actualiza la recepción y popula las referencias

    if (!recepcionActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }
    req.io.emit("recepcion-modificada", recepcionActualizada); // Emite un evento de WebSocket para notificar la modificación
    res.json(recepcionActualizada); // Responde con los datos de la recepción actualizada
  } catch (err) {
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) una recepción
const recepcionDelete = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL
  console.log("aqui entro", id);
  try {
    const recepcion = await Recepcion.findByIdAndUpdate(
      id,
      { eliminado: true }, // Marca la recepción como eliminada
      { new: true }
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!recepcion) {
      return res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }

    res.json(recepcion); // Responde con los datos de la recepción eliminada
  } catch (err) {
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const recepcionPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  recepcionPost, // Crear una nueva recepción
  recepcionGet, // Obtener una recepción específica por ID
  recepcionGets, // Obtener todas las recepciones
  recepcionPut, // Actualizar una recepción existente
  recepcionDelete, // Eliminar (marcar como eliminado) una recepción
  recepcionPatch, // Manejar solicitudes PATCH
};
