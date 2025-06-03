const { response, request } = require("express");
const mongoose = require("mongoose");
const ChequeoCantidadBK = require("../../models/bunkering/chequeoCantidadBK");
const RecepcionBK = require("../../models/bunkering/recepcionBK");
const DespachoBK = require("../../models/bunkering/despachoBK");
const TanqueBK = require("../../models/bunkering/tanqueBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  {
    path: "aplicar.idReferencia",
    select: {
      nombre: 1,
      idGuia: 1,
    },
  },
  { path: "idProducto", select: "nombre" },
  { path: "idOperador", select: "nombre" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Función auxiliar para actualizar el modelo relacionado
const actualizarModeloRelacionadoBK = async (idReferencia, tipo, datos) => {
  try {
    let resultado;
    if (tipo === "Recepcion") {
      resultado = await RecepcionBK.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    } else if (tipo === "Despacho") {
      resultado = await DespachoBK.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    } else if (tipo === "Tanque") {
      resultado = await TanqueBK.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    }
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

// Controlador para obtener todos los chequeos de cantidad
const chequeoCantidadBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, chequeoCantidads] = await Promise.all([
      ChequeoCantidadBK.countDocuments(query),
      ChequeoCantidadBK.find(query)
        .populate(populateOptions)
        .sort({ numeroChequeoCantidad: -1 }),
    ]);
    chequeoCantidads.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({ total, chequeoCantidads });
  } catch (err) {
    console.error("Error en chequeoCantidadBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los chequeos de cantidad.",
    });
  }
};

// Controlador para obtener un chequeo de cantidad específico por ID
const chequeoCantidadBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidad = await ChequeoCantidadBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);
    chequeoCantidad.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoCantidad);
  } catch (err) {
    console.error("Error en chequeoCantidadBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el chequeo de cantidad.",
    });
  }
};

// Controlador para crear un nuevo chequeo de cantidad
const chequeoCantidadBKPost = async (req = request, res = response) => {
  const {
    idBunkering,
    aplicar,
    idProducto,
    idOperador,
    fechaChequeo,
    cantidad,
    estado,
  } = req.body;

  try {
    const nuevoChequeo = new ChequeoCantidadBK({
      idBunkering,
      aplicar,
      idProducto,
      idOperador,
      fechaChequeo,
      cantidad,
      estado,
      createdBy: req.usuario._id,
    });

    await nuevoChequeo.save();
    await nuevoChequeo.populate(populateOptions);

    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionadoBK(aplicar.idReferencia, aplicar.tipo, {
        idChequeoCantidad: nuevoChequeo._id,
      });
    }

    res.status(201).json(nuevoChequeo);
  } catch (err) {
    console.error("Error en chequeoCantidadBKPost:", err);
    let errorMsg =
      "Error interno del servidor al crear el chequeo de cantidad.";
    if (err.code === 11000) {
      errorMsg = "Ya existe un chequeo de cantidad con ese número.";
    }
    res.status(400).json({ error: errorMsg });
  }
};

// Actualizar un chequeo de cantidad existente
const chequeoCantidadBKPut = async (req = request, res = response) => {
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
    const antes = await ChequeoCantidadBK.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const chequeoActualizado = await ChequeoCantidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        aplicar,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionadoBK(aplicar.idReferencia, aplicar.tipo, {
        chequeoCantidad: chequeoActualizado._id,
      });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCantidadBKPut:", err);
    let errorMsg =
      "Error interno del servidor al actualizar el chequeo de cantidad.";
    if (err.code === 11000) {
      errorMsg = "Ya existe un chequeo de cantidad con ese número.";
    }
    res.status(400).json({ error: errorMsg });
  }
};

// Eliminar (marcar como eliminado) un chequeo de cantidad
const chequeoCantidadBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    // Auditoría: captura estado antes de eliminar
    const antes = await ChequeoCantidadBK.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };
    const chequeo = await ChequeoCantidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }
    // Actualizar el modelo relacionado
    if (
      chequeo.aplicar &&
      chequeo.aplicar.idReferencia &&
      chequeo.aplicar.tipo
    ) {
      await actualizarModeloRelacionadoBK(
        chequeo.aplicar.idReferencia,
        chequeo.aplicar.tipo,
        {
          chequeoCantidad: null,
        }
      );
    }

    res.json(chequeo);
  } catch (err) {
    console.error("Error en chequeoCantidadBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el chequeo de cantidad.",
    });
  }
};

// Controlador para manejar solicitudes PATCH
const chequeoCantidadBKPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { aplicar, ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCantidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }
    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionadoBK(aplicar.idReferencia, aplicar.tipo, {
        chequeoCantidad: chequeoActualizado._id,
      });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCantidadBKPatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente el chequeo de cantidad.",
    });
  }
};

module.exports = {
  chequeoCantidadBKGets,
  chequeoCantidadBKGet,
  chequeoCantidadBKPost,
  chequeoCantidadBKPut,
  chequeoCantidadBKDelete,
  chequeoCantidadBKPatch,
};
