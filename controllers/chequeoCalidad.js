// Importaciones necesarias
const { response, request } = require("express");
const ChequeoCalidad = require("../models/chequeoCalidad");
const Recepcion = require("../models/recepcion");
const Despacho = require("../models/despacho");
const Tanque = require("../models/tanque");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  {
    path: "aplicar.idReferencia",
    select: {
      nombre: 1,
      idGuia: 1,
      idGuia: 1,
    },
  },
  { path: "idProducto", select: "nombre" },
  { path: "idOperador", select: "nombre" },
];

// Función auxiliar para actualizar el modelo relacionado
const actualizarModeloRelacionado = async (idReferencia, tipo, datos) => {
  try {
    console.log(`Actualizando modelo relacionado: ${tipo}`);
    console.log(`ID de referencia: ${idReferencia}`);
    console.log(`Datos enviados:`, datos);

    let resultado;

    if (tipo === "Recepcion") {
      resultado = await Recepcion.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true } // Asegúrate de incluir esta opción
      );
    } else if (tipo === "Despacho") {
      resultado = await Despacho.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    } else if (tipo === "Tanque") {
      resultado = await Tanque.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    }

    console.log("Resultado de la actualización:", resultado);

    if (!resultado) {
      throw new Error(
        `No se encontró el modelo ${tipo} con ID: ${idReferencia}`
      );
    }
  } catch (err) {
    console.error(`Error al actualizar el modelo ${tipo}:`, err);
    throw new Error(`Error al actualizar el modelo ${tipo}`);
  }
};
// Controlador para obtener todos los chequeos de calidad
const chequeoCalidadGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo chequeos activos y no eliminados

  try {
    const [total, chequeoCalidads] = await Promise.all([
      ChequeoCalidad.countDocuments(query), // Cuenta el total de chequeos
      ChequeoCalidad.find(query).populate(populateOptions), // Obtiene los chequeos con IdReferencia pobladas
    ]);

    if (chequeoCalidads.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron chequeos de calidad con los criterios proporcionados.",
      });
    }

    res.json({ total, chequeoCalidads }); // Responde con el total y la lista de chequeos
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
    estado,
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
      estado,
    });

    await nuevoChequeo.save();
    await nuevoChequeo.populate(populateOptions);

    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        idChequeoCalidad: nuevoChequeo._id, // Cambiado a idChequeoCalidad
      });
    }

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
  const { _id, aplicar, ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        chequeoCalidad: chequeoActualizado._id,
      });
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
  const { _id, aplicar, ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        chequeoCalidad: chequeoActualizado._id,
      });
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

    // Actualizar el modelo relacionado
    if (
      chequeo.aplicar &&
      chequeo.aplicar.idReferencia &&
      chequeo.aplicar.tipo
    ) {
      await actualizarModeloRelacionado(
        chequeo.aplicar.idReferencia,
        chequeo.aplicar.tipo,
        {
          chequeoCalidad: null, // Eliminar la referencia al chequeo
        }
      );
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
