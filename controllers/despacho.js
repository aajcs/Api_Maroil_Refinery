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

// Controlador para obtener todos los despachos con población de referencias
const despachoGets = async (req = request, res = response) => {
  const query = {}; // Filtro para obtener todos los despachos

  try {
    const [total, despachos] = await Promise.all([
      Despacho.countDocuments(query), // Cuenta el total de despachos
      Despacho.find(query).populate(populateOptions), // Obtiene los despachos con referencias pobladas
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

// Controlador para obtener un despacho específico por ID
const despachoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del despacho desde los parámetros de la URL

  try {
    const despachoActualizada = await Despacho.findById(id).populate(
      populateOptions
    ); // Busca el despacho por ID y popula las referencias

    if (despachoActualizada) {
      res.json(despachoActualizada); // Responde con los datos del despacho
    } else {
      res.status(404).json({
        msg: "Despacho no encontrado", // Responde con un error 404 si no se encuentra el despacho
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear un nuevo despacho
const despachoPost = async (req, res = response) => {
  const {
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,
    cantidadDespacho,
    cantidadEnviada,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaDespacho,
    idGuia,
    placa,
    nombreChofer,
    apellidoChofer,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  const nuevaDespacho = new Despacho({
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,
    cantidadDespacho,
    cantidadEnviada,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaDespacho,
    idGuia,
    placa,
    nombreChofer,
    apellidoChofer,
  });

  try {
    await nuevaDespacho.save(); // Guarda el nuevo despacho en la base de datos

    await nuevaDespacho.populate(populateOptions); // Poblar referencias después de guardar

    res.json({ despacho: nuevaDespacho }); // Responde con el despacho creado
  } catch (err) {
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar un despacho existente
const despachoPut = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID del despacho desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const despachoActualizada = await Despacho.findByIdAndUpdate(id, resto, {
      new: true,
    }).populate(populateOptions); // Actualiza el despacho y popula las referencias

    if (!despachoActualizada) {
      return res.status(404).json({
        msg: "Despacho no encontrado", // Responde con un error 404 si no se encuentra el despacho
      });
    }
    req.io.emit("despacho-modificada", despachoActualizada); // Emite un evento de WebSocket para notificar la modificación
    res.json(despachoActualizada); // Responde con los datos del despacho actualizado
  } catch (err) {
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) un despacho
const despachoDelete = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID del despacho desde los parámetros de la URL

  try {
    const despacho = await Despacho.findByIdAndUpdate(
      id,
      { eliminado: true }, // Marca el despacho como eliminado
      { new: true }
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!despacho) {
      return res.status(404).json({
        msg: "Despacho no encontrado", // Responde con un error 404 si no se encuentra el despacho
      });
    }

    res.json(despacho); // Responde con los datos del despacho eliminado
  } catch (err) {
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const despachoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - despachoPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  despachoPost, // Crear un nuevo despacho
  despachoGet, // Obtener un despacho específico por ID
  despachoGets, // Obtener todos los despachos
  despachoPut, // Actualizar un despacho existente
  despachoDelete, // Eliminar (marcar como eliminado) un despacho
  despachoPatch, // Manejar solicitudes PATCH
};
