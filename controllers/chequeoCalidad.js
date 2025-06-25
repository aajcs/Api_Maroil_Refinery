// Importaciones necesarias
const { response, request } = require("express");
const mongoose = require("mongoose"); // Importa mongoose
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
  { path: "createdBy", select: "nombre correo" }, // Popula quién creó la torre

  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  }, // Popula historial.modificadoPor en el array
];

// Función auxiliar para actualizar el modelo relacionado
const actualizarModeloRelacionado = async (idReferencia, tipo, datos) => {
  try {
    console.log(`Actualizando modelo relacionado: ${tipo}`);
    console.log(`ID de referencia: ${idReferencia}`);
    console.log(`Datos enviados para la actualización:`, datos);

    if (!mongoose.Types.ObjectId.isValid(idReferencia)) {
      throw new Error(`El ID de referencia no es válido: ${idReferencia}`);
    }

    const modelo =
      tipo === "Recepcion"
        ? Recepcion
        : tipo === "Despacho"
        ? Despacho
        : tipo === "Tanque"
        ? Tanque
        : null;

    if (!modelo) {
      throw new Error(`Tipo de modelo no válido: ${tipo}`);
    }

    const documentoExistente = await modelo.findById(idReferencia);
    if (!documentoExistente) {
      throw new Error(
        `No se encontró el modelo ${tipo} con ID: ${idReferencia}`
      );
    }

    const resultado = await modelo.findByIdAndUpdate(
      idReferencia,
      { $set: datos },
      { new: true }
    );

    console.log("Resultado de la actualización:", resultado);

    if (!resultado) {
      throw new Error(
        `No se pudo actualizar el modelo ${tipo} con ID: ${idReferencia}`
      );
    }

    return resultado;
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para obtener todos los chequeos de calidad
const chequeoCalidadGets = async (req = request, res = response, next) => {
  const query = { eliminado: false }; // Filtro para obtener solo chequeos activos y no eliminados

  try {
    const [total, chequeoCalidads] = await Promise.all([
      ChequeoCalidad.countDocuments(query), // Cuenta el total de chequeos
      ChequeoCalidad.find(query).populate(populateOptions), // Obtiene los chequeos con IdReferencia pobladas
    ]);

    // Ordenar historial por fecha ascendente en cada torre
    chequeoCalidads.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, chequeoCalidads }); // Responde con el total y la lista de chequeos
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para obtener un chequeo de calidad específico por ID
const chequeoCalidadGet = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const chequeoCalidad = await ChequeoCalidad.findOne({
      _id: id,
      estado: "true",
      eliminado: false,
    }).populate(populateOptions);
    // Ordenar historial por fecha ascendente en cada torre
    chequeoCalidad.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoCalidad);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para crear un nuevo chequeo de calidad
const chequeoCalidadPost = async (req = request, res = response, next) => {
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
      createdBy: req.usuario._id, // ID del usuario que creó el tanque
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
    next(err); // Propaga el error al middleware
  }
};

// Controlador para actualizar un chequeo de calidad existente
const chequeoCalidadPut = async (req = request, res = response, next) => {
  const { id } = req.params;
  const { _id, aplicar, ...resto } = req.body;

  try {
    // Validar que idReferencia sea un ObjectId válido
    if (
      aplicar &&
      aplicar.idReferencia &&
      !mongoose.Types.ObjectId.isValid(aplicar.idReferencia)
    ) {
      return res.status(400).json({
        error: "El ID de referencia no es válido.",
      });
    }
    const antes = await ChequeoCalidad.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    } // Actualiza el tipo de producto en la base de datos y devuelve el tipo de producto actualizado

    const chequeoActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        aplicar,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      }, // Datos a actualizar
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        idChequeoCalidad: chequeoActualizado._id,
      });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const chequeoCalidadPatch = async (req = request, res = response, next) => {
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
    next(err); // Propaga el error al middleware
  }
};

// Controlador para eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadDelete = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    // Auditoría: captura estado antes de eliminar
    const antes = await ChequeoCalidad.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };
    const chequeo = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
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
    next(err); // Propaga el error al middleware
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
