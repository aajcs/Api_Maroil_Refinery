const { response, request } = require("express");
const Recepcion = require("../models/recepcion");
const Contrato = require("../models/contrato");

// Obtener todas las recepcions con paginación y población de referencias
const recepcionGets = async (req = request, res = response) => {
  const query = {};

  try {
    const [total, recepcions] = await Promise.all([
      Recepcion.countDocuments(query),
      Recepcion.find(query)
        .populate({
          path: "idContrato",
          select: "idRefineria idContacto idItems numeroContrato",
          populate: [
            { path: "idRefineria", select: "nombre" },
            { path: "idContacto", select: "nombre" },
            { path: "idItems" },
          ],
        })
        .populate("idRefineria", "nombre")
        .populate("idLinea", "nombre")
        .populate("idTanque", "nombre")
        .populate("idContratoItems"),
    ]);

    res.json({
      total,
      recepcions,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una recepción específica por ID

const recepcionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const recepcionActualizada = await Recepcion.findById(id)
      .populate({
        path: "idContrato",
        select: "idRefineria idContacto idItems numeroContrato",
        populate: [
          { path: "idRefineria", select: "nombre" },
          { path: "idContacto", select: "nombre" },
          // { path: "idItems", select: "producto cantidad" },
        ],
      })
      .populate({
        path: "idContratoItems",
        select: "producto cantidad",
      })
      .populate({
        path: "idLinea",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
        // Eliminamos el path idTanque ya que no es necesario poblarlo dos veces
      });

    if (recepcionActualizada) {
      res.json(recepcionActualizada);
    } else {
      res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva recepción
const recepcionPost = async (req, res = response) => {
  const {
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,

    // Información de la recepción
    cantidadRecibida,
    cantidadEnviada,
    estadoCarga,
    estado,

    // Fechas
    fechaInicio,
    fechaFin,
    fechaDespacho,

    // Información del transporte
    idGuia,
    placa,
    nombreChofer,
    apellidoChofer,
  } = req.body;

  const nuevaRecepcion = new Recepcion({
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idRefineria,
    idTanque,

    // Información de la recepción
    cantidadRecibida,
    cantidadEnviada,
    estadoCarga,
    estado,

    // Fechas
    fechaInicio,
    fechaFin,
    fechaDespacho,

    // Información del transporte
    idGuia,
    placa,
    nombreChofer,
    apellidoChofer,
  });

  try {
    await nuevaRecepcion.save();

    await nuevaRecepcion.populate([
      { path: "idRefineria", select: "nombre" },
      {
        path: "idContrato",
        select: "numeroContrato idRefineria idContacto idItems",
        populate: [
          { path: "idRefineria", select: "nombre" },
          { path: "idContacto", select: "nombre" },
          { path: "idItems" },
        ],
      },
      { path: "idLinea", select: "nombre" },
      { path: "idTanque", select: "nombre" },
      { path: "idContratoItems" },
    ]);

    res.json({ recepcion: nuevaRecepcion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una recepción existente
const recepcionPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const recepcionActualizada = await Recepcion.findByIdAndUpdate(id, resto, {
      new: true,
    })
      .populate({
        path: "idContrato",
        select: "idRefineria idContacto idItems numeroContrato",
        populate: [
          { path: "idRefineria", select: "nombre" },
          { path: "idContacto", select: "nombre" },
          { path: "idItems" },
        ],
      })
      .populate("idRefineria", "nombre")
      .populate("idLinea", "nombre")
      .populate("idTanque", "nombre")
      .populate("idContratoItems");
    // .populate({
    //   path: "idContrato",
    //   select: "idRefineria idContacto idContratoItems numeroContrato",
    //   populate: [
    //     { path: "idRefineria", select: "nombre" },
    //     { path: "idContacto", select: "nombre" },
    //   ],
    // })
    // .populate({
    //   path: "idContratoItems",
    //   select: "producto cantidad",
    // })
    // .populate({
    //   path: "idLinea",
    //   select: "nombre",
    //   populate: { path: "idLinea", select: "nombre" },
    // })
    // .populate({
    //   path: "idRefineria",
    //   select: "nombre",
    //   populate: { path: "idRefineria", select: "nombre" },
    // });
    if (!recepcionActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
    req.io.emit("recepcion-modificada", recepcionActualizada);
    res.json(recepcionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una recepción
const recepcionDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const recepcion = await Recepcion.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    ).populate({
      path: "idContrato",
      select: "idRefineria idContacto",
      populate: [
        { path: "idRefineria", select: "nombre" },
        { path: "idContacto", select: "nombre" },
      ],
    });

    if (!recepcion) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }

    res.json(recepcion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const recepcionPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  recepcionPost,
  recepcionGet,
  recepcionGets,
  recepcionPut,
  recepcionDelete,
  recepcionPatch,
};
