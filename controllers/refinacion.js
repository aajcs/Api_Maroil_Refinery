// const { response, request } = require("express");
const Refinacion = require("../models/refinacion");

// Obtener todas las refinaciones con paginación y población de referencias
const refinacionGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  try {
    const [total, refinaciones] = await Promise.all([
      Refinacion.countDocuments(query),
      Refinacion.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate({
          path: "idTanque",
          select: "nombre",
        })
        .populate({
          path: "idTorre",
          select: "nombre",
        }),
    ]);

    res.json({
      total,
      refinaciones,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una refinación específica por ID
const refinacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findOne({
      _id: id,
      eliminado: false,
    })
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      });

    if (!refinacion) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const refinacionPost = async (req = request, res = response) => {
  const {
    idTanque,
    idTorre,
    materiaPrima,
    cantidadRecibida,
    fechaRecepcion,
    proceso,
    fechaInicio,
    fechaFin,
    temperatura,
    presion,
    duracionHoras,
    derivados,
    controlCalidad,
    observaciones,
    fechaRevision,
    historialOperaciones,
    fecha,
    operacion,
    usuario,
    estado,
  } = req.body;

  try {
    // Crear la nueva refinación
    const nuevaRefinacion = new Refinacion({
      idTanque,
      idTorre,
      materiaPrima,
      cantidadRecibida,
      fechaRecepcion,
      proceso,
      fechaInicio,
      fechaFin,
      temperatura,
      presion,
      duracionHoras,
      derivados,
      controlCalidad,
      observaciones,
      fechaRevision,
      historialOperaciones,
      fecha,
      operacion,
      usuario,
      estado,
    });

    // Guardar la refinación en la base de datos
    await nuevaRefinacion.save();

    // Obtener la refinación con las referencias pobladas
    const refinacionPoblada = await Refinacion.findById(nuevaRefinacion._id)
      .populate({
        path: "idTanque",
        select: "nombre", // Selecciona solo el campo "nombre" del tanque
      })
      .populate({
        path: "idTorre",
        select: "nombre", // Selecciona solo el campo "nombre" de la torre
      });

    // Responder con el documento poblado
    res.status(201).json(refinacionPoblada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una refinación existente
const refinacionPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const refinacionActualizada = await Refinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    )
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      });

    if (!refinacionActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacionActualizada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una refinación
const refinacionDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    )
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      });

    if (!refinacion) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una refinación (ejemplo básico)
const refinacionPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refinacionPatch",
  });
};

module.exports = {
  refinacionPost,
  refinacionGet,
  refinacionGets,
  refinacionPut,
  refinacionDelete,
  refinacionPatch,
};
