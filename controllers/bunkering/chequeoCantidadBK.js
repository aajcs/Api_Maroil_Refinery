const { response, request } = require("express");
const ChequeoCantidadBK = require("../../models/bunkering/chequeoCantidadBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  { path: "idProducto", select: "nombre" },
  { path: "idOperador", select: "nombre" },
  // Si necesitas poblar aplicar.idReferencia según el tipo, deberás hacerlo manualmente
];

// Obtener todos los chequeos de cantidad
const chequeoCantidadBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, chequeos] = await Promise.all([
      ChequeoCantidadBK.countDocuments(query),
      ChequeoCantidadBK.find(query).populate(populateOptions).sort({ numeroChequeoCantidad: -1 }),
    ]);
    chequeos.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({ total, chequeos });
  } catch (err) {
    console.error("Error en chequeoCantidadBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los chequeos de cantidad.",
    });
  }
};

// Obtener un chequeo de cantidad por ID
const chequeoCantidadBKGet = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const chequeo = await ChequeoCantidadBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeo);
  } catch (err) {
    console.error("Error en chequeoCantidadBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el chequeo de cantidad.",
    });
  }
};

// Crear un nuevo chequeo de cantidad
const chequeoCantidadBKPost = async (req = request, res = response) => {
  try {
    const data = req.body;
    data.createdBy = req.usuario?._id;

    const nuevoChequeo = new ChequeoCantidadBK(data);
    await nuevoChequeo.save();
    await nuevoChequeo.populate(populateOptions);

    res.status(201).json(nuevoChequeo);
  } catch (err) {
    console.error("Error en chequeoCantidadBKPost:", err);
    let errorMsg = "Error interno del servidor al crear el chequeo de cantidad.";
    if (err.code === 11000) {
      errorMsg = "Ya existe un chequeo de cantidad con ese número.";
    }
    res.status(400).json({ error: errorMsg });
  }
};

// Actualizar un chequeo de cantidad existente
const chequeoCantidadBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await ChequeoCantidadBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }
    const cambios = {};
    for (let key in resto) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const chequeoActualizado = await ChequeoCantidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCantidadBKPut:", err);
    let errorMsg = "Error interno del servidor al actualizar el chequeo de cantidad.";
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
    const antes = await ChequeoCantidadBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const chequeoEliminado = await ChequeoCantidadBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoEliminado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json({
      msg: "Chequeo de cantidad eliminado correctamente.",
      chequeo: chequeoEliminado,
    });
  } catch (err) {
    console.error("Error en chequeoCantidadBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el chequeo de cantidad.",
    });
  }
};

// Controlador para manejar solicitudes PATCH (opcional)
const chequeoCantidadBKPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCantidadBKPatch",
  });
};

module.exports = {
  chequeoCantidadBKGets,
  chequeoCantidadBKGet,
  chequeoCantidadBKPost,
  chequeoCantidadBKPut,
  chequeoCantidadBKDelete,
  chequeoCantidadBKPatch,
};