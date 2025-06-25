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
      populate: [
        { path: "producto", select: "nombre" }, // Relación con el modelo Producto
        { path: "idTipoProducto", select: "nombre" }, // Relación con el modelo TipoProducto
      ],
    },
  },
  { path: "idChequeoCalidad" }, // Población del chequeo de calidad
  { path: "idChequeoCantidad" }, // Población del chequeo de cantidad
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
  { path: "createdBy", select: "nombre correo" }, // Popula quién creó la torre
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  }, // Popula historial.modificadoPor en el array
];

// Controlador para obtener todas las recepciones con población de referencias
const recepcionGets = async (req = request, res = response, next) => {
  const query = { eliminado: false }; // Filtro para obtener todas las recepciones

  try {
    const [total, recepcions] = await Promise.all([
      Recepcion.countDocuments(query), // Cuenta el total de recepciones
      Recepcion.find(query).populate(populateOptions), // Obtiene las recepciones con referencias pobladas
    ]);
    // Ordenar historial por fecha ascendente en cada torre
    recepcions.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({
      total,
      recepcions,
    });
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para obtener una recepción específica por ID
const recepcionGet = async (req = request, res = response, next) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL

  try {
    const recepcionActualizada = await Recepcion.findById(id).populate(
      populateOptions
    ); // Busca la recepción por ID y la popula
    // Ordenar historial por fecha ascendente en cada torre
    recepcionActualizada.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    if (recepcionActualizada) {
      res.json(recepcionActualizada); // Responde con los datos de la recepción
    } else {
      res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }
  } catch (err) {
    next(err); // Propaga el error al middleware
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
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoRecepcion,
    estadoCarga,
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
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  const nuevaRecepcion = new Recepcion({
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoRecepcion,
    estadoCarga,
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
    createdBy: req.usuario._id, // ID del usuario que creó el tanque
  });

  try {
    await nuevaRecepcion.save(); // Guarda la nueva recepción en la base de datos

    await nuevaRecepcion.populate(populateOptions); // Poblar referencias después de guardar

    res.json({ recepcion: nuevaRecepcion }); // Responde con la recepción creada
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para actualizar una recepción existente
const recepcionPut = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const antes = await Recepcion.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }
    const recepcionActualizada = await Recepcion.findByIdAndUpdate(
      id,
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      }, // Actualiza la recepción y agrega un historial de cambios
      {
        new: true,
      }
    ).populate(populateOptions); // Actualiza la recepción y popula las referencias

    if (!recepcionActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }
    req.io.emit("recepcion-modificada", recepcionActualizada); // Emite un evento de WebSocket para notificar la modificación
    res.json(recepcionActualizada); // Responde con los datos de la recepción actualizada
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para eliminar (marcar como eliminado) una recepción
const recepcionDelete = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL
  console.log("aqui entro", id);
  try {
    // Auditoría: captura estado antes de eliminar
    const antes = await Recepcion.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };
    const recepcion = await Recepcion.findByIdAndUpdate(
      id,
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!recepcion) {
      return res.status(404).json({
        msg: "Recepción no encontrada", // Responde con un error 404 si no se encuentra la recepción
      });
    }

    res.json(recepcion); // Responde con los datos de la recepción eliminada
  } catch (err) {
    next(err); // Propaga el error al middleware
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
