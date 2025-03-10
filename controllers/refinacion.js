const { response, request } = require("express");
const Refinacion = require("../models/refinacion");
//const Derivado = require("../models/derivados");

// Obtener todas las refinaciones con paginación y población de referencias
const refinacionGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, refinaciones] = await Promise.all([
      Refinacion.countDocuments(query),
      Refinacion.find(query)
        // .populate({
        //   path: "idTanque",
        //   select: "nombre",
        // })
        .populate({
          path: "idTorre",
          select: "nombre",
        })
        .populate({
          path: "idChequeoCalidad",
          select: "nombre",
        })
        .populate({
          path: "idChequeoCantidad",
          select: "nombre",
        })
        .populate({
          path: "idRefineria",
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
      estado: true,
      eliminado: false,
    })
      // .populate({
      //   path: "idTanque",
      //   select: "nombre",
      // })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idChequeoCalidad",
        select: "nombre",
      })
      .populate({
        path: "idChequeoCantidad",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
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

// Crear una nueva refinación
const refinacionPost = async (req = request, res = response) => {
  const {
    idTorre,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    idRefineria,
    historialOperaciones,
    material,
  } = req.body;

  try {
    const nuevaRefinacion = new Refinacion({
      idTorre,
      idChequeoCalidad,
      idChequeoCantidad,
      cantidadRecibida,
      idRefineria,
      historialOperaciones,
      material,
    });

    await nuevaRefinacion.save();

    await nuevaRefinacion.populate([
      { path: "idTorre", select: "nombre" },
      { path: "idChequeoCalidad", select: "nombre" },
      { path: "idChequeoCantidad", select: "nombre" },
      { path: "idRefineria", select: "nombre" },
      { path: "material.idTanque", select: "nombre" },
      // {
      //   path: "material",
      //   select: "idTanque",
      //   populate: {
      //     path: "idTanque",
      //     select: "nombre", // Selecciona los campos que deseas obtener del tanque
      //   },
      // },
    ]);

    res.status(201).json(nuevaRefinacion);
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
      // .populate({
      //   path: "idTanque",
      //   select: "nombre",
      // })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idChequeoCalidad",
        select: "nombre",
      })
      .populate({
        path: "idChequeoCantidad",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
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
      })
      .populate({
        path: "idChequeoCalidad",
        select: "nombre",
      })
      .populate({
        path: "idChequeoCantidad",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
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
  refinacionGets,
  refinacionGet,
  refinacionPost,
  refinacionPut,
  refinacionDelete,
  refinacionPatch,
};
