const { response, request } = require("express");
const Refinacion = require("../models/refinacion");
//const Contrato = require("../models/contrato");

// Obtener todas las refinacion con paginación y población de referencias
const refinacionGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, refinacion] = await Promise.all([
      Refinacion.countDocuments(query),
      Refinacion.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate("id_contrato"),
    ]);

    // Poblar id_refineria e id_contacto de cada recepción
    await Promise.all(
      refinacion.map(async (refinacion) => {
        await refinacion
          .populate({
            path: "id_contrato",
            select: "id_refineria id_contacto",
            populate: [
              { path: "id_refineria", select: "nombre" },
              { path: "id_contacto", select: "nombre" },
            ],
          })
          .populate({
            path: "id_linea",
            select: "nombre",
            populate: { path: "id_linea", select: "nombre" },
          })
          .execPopulate();
      })
    );

    res.json({
      total,
      refinacion,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener una recepción específica por ID
const refinacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacionActualizado = await Refinacion.findById(id)
      .populate({
        path: "id_contrato",
        select: "id_refineria id_contacto",
        populate: [
          { path: "id_refineria", select: "nombre" },
          { path: "id_contacto", select: "nombre" },
        ],
      })
      .populate({
        path: "id_linea",
        select: "nombre",
        populate: { path: "id_linea", select: "nombre" },
      });

    if (refinacionActualizado) {
      res.json(refinacionActualizado);
    } else {
      res.status(404).json({
        msg: "Refinacion no encontrada",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva refinacion
const refinacionPost = async (req, res = response) => {
  const {
    // contrato,
    cantidadProducida,
    // precioUnitario,
    // montoTotal,
    // estado,
    // fechaRecepcion,
    // hora,
    // id_lote,
    // id_contrato,
    // id_linea,
    // id_tanque,
    // id_guia,
    // placa,
    // nombre_chofer,
    // apellido_chofer,
  } = req.body;

  const nuevaRefinacion = new Refinacion({
    // contrato,
    cantidadProducida,
    // precioUnitario,
    // montoTotal,
    // estado,
    // fechaRecepcion,
    // hora,
    // id_lote,
    // id_contrato,
    // id_linea,
    id_tanque,
    // id_guia,
    // placa,
    // nombre_chofer,
    // apellido_chofer,
  });

  try {
    await nuevaRefinacion.save();

    await nuevaRefinacion
      .populate({
        path: "id_contrato",
        select: "id_refineria id_contacto",
        populate: [
          { path: "id_refineria", select: "nombre" },
          { path: "id_contacto", select: "nombre" },
        ],
      })
      .populate({
        path: "id_linea",
        select: "nombre",
        populate: { path: "id_linea", select: "nombre" },
      })
      .execPopulate(),
      res.json({ refinacion: nuevaRefinacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una refinacion existente
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
        path: "id_contrato",
        select: "id_refineria id_contacto",
        populate: [
          { path: "id_refineria", select: "nombre" },
          { path: "id_contacto", select: "nombre" },
        ],
      })
      .populate({
        path: "id_linea",
        select: "nombre",
        populate: { path: "id_linea", select: "nombre" },
      });
    if (!refinacionActualizada) {
      return res.status(404).json({
        msg: "Refinacion no encontrada",
      });
    }

    res.json(refinacionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una recepción
const refinacionDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    ).populate({
      path: "id_contrato",
      select: "id_refineria id_contacto",
      populate: [
        { path: "id_refineria", select: "nombre" },
        { path: "id_contacto", select: "nombre" },
      ],
    });

    if (!refinacion) {
      return res.status(404).json({
        msg: "Refinacion no encontrado",
      });
    }

    res.json(refinacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refinacionPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
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
