const { response, request } = require("express");
const Refinacion = require("../models/refinacion");

// Obtener todas las refinaciones con paginación y población de referencias
const refinacionGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, refinaciones] = await Promise.all([
      Refinacion.countDocuments(query),
      Refinacion.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate("idTanque")
        .populate("idTorre"),
    ]);

    // Poblar idTanque y otros campos relacionados de cada refinación
    await Promise.all(
      refinaciones.map(async (refinacion) => {
        await refinacion
          .populate({
            path: "idTanque",
            select: "nombre",
          })
          .populate({
            path: "idTorre",
            select: "nombre",
          })
          .execPopulate();
      })
    );

    res.json({
      total,
      refinaciones,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener una refinación específica por ID
const refinacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findById(id).populate({
      path: "idTanque",
      select: "nombre".populate({
        path: "idTanque",
        select: "nombre",
      }),
    });

    if (refinacion) {
      res.json(refinacion);
    } else {
      res.status(404).json({
        msg: "Refinación no encontrada",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva refinación
const refinacionPost = async (req, res = response) => {
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

  try {
    await nuevaRefinacion.save();

    await nuevaRefinacion
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .execPopulate();

    res.json({ refinacion: nuevaRefinacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una refinación existente
const refinacionPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const refinacionActualizada = await Refinacion.findByIdAndUpdate(
      id,
      resto,
      {
        new: true,
      }
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
      return res.status(404).json({
        msg: "Refinación no encontrada",
      });
    }

    res.json(refinacionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una refinación
const refinacionDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    ).populate({
      path: "idTanque",
      select: "nombre",
    });

    if (!refinacion) {
      return res.status(404).json({
        msg: "Refinación no encontrada",
      });
    }

    res.json(refinacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refinacionPatch = (req, res = response) => {
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
