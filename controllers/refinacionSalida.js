// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const RefinacionSalida = require("../models/refinacionSalida"); // Modelo RefinacionSalida para interactuar con la base de datos
const { Refinacion } = require("../models"); // Modelo Refinacion para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idRefinacion", // Relación con el modelo Refinacion
    select:
      "numeroRefinacion idTorre idProducto cantidadTotal derivado descripcion",
    populate: [
      { path: "idProducto", select: "nombre" },
      { path: "idTorre", select: "nombre" },
      {
        path: "derivado",
        populate: [{ path: "idProducto", select: "nombre" }],
      },
    ],
  },
  { path: "idTanque", select: "nombre" }, // Relación con el modelo Tanque
  {
    path: "idChequeoCalidad", // Relación con el modelo ChequeoCalidad
    select: "idProducto idTanque gravedadAPI azufre contenidoAgua",
    populate: [
      { path: "idProducto", select: "nombre" },
      { path: "idTanque", select: "nombre" },
    ],
  },
  {
    path: "idChequeoCantidad", // Relación con el modelo ChequeoCantidad
    select: "idProducto idTanque gravedadAPI azufre contenidoAgua",
    populate: [
      { path: "idProducto", select: "nombre" },
      { path: "idTanque", select: "nombre" },
    ],
  },
  { path: "idProducto", select: "nombre" }, // Relación con el modelo Producto
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
];

// Controlador para obtener todas las refinaciones de salida
const refinacionSalidaGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo refinaciones no eliminadas

  try {
    const [total, refinacionSalidas] = await Promise.all([
      RefinacionSalida.countDocuments(query), // Cuenta el total de refinaciones
      RefinacionSalida.find(query).populate(populateOptions), // Obtiene las refinaciones con referencias pobladas
    ]);

    res.json({ total, refinacionSalidas }); // Responde con el total y la lista de refinaciones
  } catch (err) {
    console.error("Error en refinacionSalidaGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    res.status(500).json({
      error:
        "Error interno del servidor al obtener las refinaciones de salida.",
    });
  }
};

// Controlador para obtener una refinación específica por ID
const refinacionSalidaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacionSalida = await RefinacionSalida.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!refinacionSalida) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacionSalida);
  } catch (err) {
    console.error("Error en refinacionSalidaGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la refinación.",
    });
  }
};

// Controlador para crear una nueva refinación de salida
const refinacionSalidaPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idRefinacion,
    idTanque,
    cantidad,
    descripcion,
    idProducto,
    operador,
    estadoRefinacionSalida,
    cantidadTotal,
    fechaFin,
  } = req.body;

  try {
    const nuevaRefinacionSalida = new RefinacionSalida({
      idRefineria,
      idRefinacion,
      idTanque,
      cantidad,
      descripcion,
      idProducto,
      operador,
      estadoRefinacionSalida,
      cantidadTotal,
      fechaFin,
    });

    await nuevaRefinacionSalida.save(); // Guarda la nueva refinación en la base de datos

    // Actualiza la relación en el modelo Refinacion
    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idRefinacionSalida: nuevaRefinacionSalida._id } },
      { new: true }
    );

    await nuevaRefinacionSalida.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaRefinacionSalida); // Responde con la refinación creada
  } catch (err) {
    console.error("Error en refinacionSalidaPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de refinación no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la refinación de salida.",
    });
  }
};

// Controlador para actualizar una refinación existente
const refinacionSalidaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idRefinacion, ...resto } = req.body;

  try {
    const refinacionSalidaActualizada = await RefinacionSalida.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!refinacionSalidaActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    if (idRefinacion) {
      // Actualiza las relaciones en el modelo Refinacion
      await Refinacion.updateMany(
        { idRefinacionSalida: id },
        { $pull: { idRefinacionSalida: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idRefinacionSalida: id } },
        { new: true }
      );
    }

    res.json(refinacionSalidaActualizada); // Responde con la refinación actualizada
  } catch (err) {
    console.error("Error en refinacionSalidaPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la refinación.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) una refinación
const refinacionSalidaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacionSalida = await RefinacionSalida.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!refinacionSalida) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    // Actualiza las relaciones en el modelo Refinacion
    await Refinacion.updateMany(
      { idRefinacionSalida: id },
      { $pull: { idRefinacionSalida: id } }
    );

    res.json(refinacionSalida); // Responde con la refinación eliminada
  } catch (err) {
    console.error("Error en refinacionSalidaDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de refinación no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la refinación.",
    });
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const refinacionSalidaPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refinacionSalidaPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  refinacionSalidaGets, // Obtener todas las refinaciones de salida
  refinacionSalidaGet, // Obtener una refinación específica por ID
  refinacionSalidaPost, // Crear una nueva refinación de salida
  refinacionSalidaPut, // Actualizar una refinación existente
  refinacionSalidaDelete, // Eliminar (marcar como eliminado) una refinación
  refinacionSalidaPatch, // Manejar solicitudes PATCH
};
