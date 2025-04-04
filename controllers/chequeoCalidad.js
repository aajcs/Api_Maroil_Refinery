// Importaciones necesarias
const { response, request } = require("express");
const ChequeoCalidad = require("../models/chequeoCalidad");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
  { path: "aplicar.referencia" }, // Población dinámica basada en el tipo de operación
  { path: "idProducto", select: "nombre" }, // Relación con el modelo Producto
  { path: "idOperador", select: "nombre" }, // Relación con el modelo Operador
];

// Controlador para obtener todos los chequeos de calidad
const chequeoCalidadGets = async (req = request, res = response) => {
  const query = { estado: "true", eliminado: false }; // Filtro para obtener solo chequeos activos y no eliminados

  try {
    const [total, chequeos] = await Promise.all([
      ChequeoCalidad.countDocuments(query), // Cuenta el total de chequeos
      ChequeoCalidad.find(query).populate(populateOptions), // Obtiene los chequeos con referencias pobladas
    ]);

    if (chequeos.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron chequeos de calidad con los criterios proporcionados.",
      });
    }

    res.json({ total, chequeos }); // Responde con el total y la lista de chequeos
  } catch (err) {
    console.error("Error en chequeoCalidadGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los chequeos de calidad.",
    });
  }
};

// Controlador para obtener un chequeo de calidad específico por ID
const chequeoCalidadGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeo = await ChequeoCalidad.findOne({
      _id: id,
      estado: "true",
      eliminado: false,
    }).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeo);
  } catch (err) {
    console.error("Error en chequeoCalidadGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el chequeo de calidad.",
    });
  }
};

// Controlador para crear un nuevo chequeo de calidad
const chequeoCalidadPost = async (req = request, res = response) => {
  const {
    idRefineria,
    aplicar,
    idProducto,
    fechaChequeo,
    gravedadAPI,
    azufre,
    contenidoAgua,
    puntoDeInflamacion,
    cetano,
    idOperador,
  } = req.body;

  try {
    const nuevoChequeo = new ChequeoCalidad({
      idRefineria,
      aplicar,
      idProducto,
      fechaChequeo,
      gravedadAPI,
      azufre,
      contenidoAgua,
      puntoDeInflamacion,
      cetano,
      idOperador,
    });

    await nuevoChequeo.save();
    await nuevoChequeo.populate(populateOptions);

    res.status(201).json(nuevoChequeo);
  } catch (err) {
    console.error("Error en chequeoCalidadPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear el chequeo de calidad.",
    });
  }
};

// Controlador para actualizar un chequeo de calidad existente
const chequeoCalidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCalidadPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el chequeo de calidad.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const chequeoCalidadPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCalidadPatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente el chequeo de calidad.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeo = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeo);
  } catch (err) {
    console.error("Error en chequeoCalidadDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el chequeo de calidad.",
    });
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  chequeoCalidadGets, // Obtener todos los chequeos de calidad
  chequeoCalidadGet, // Obtener un chequeo de calidad específico por ID
  chequeoCalidadPost, // Crear un nuevo chequeo de calidad
  chequeoCalidadPut, // Actualizar un chequeo de calidad existente
  chequeoCalidadPatch, // Actualizar parcialmente un chequeo de calidad
  chequeoCalidadDelete, // Eliminar (marcar como eliminado) un chequeo de calidad
};
