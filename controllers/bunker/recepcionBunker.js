const { response, request } = require("express");
const RecepcionBunker = require("../../models/bunker/recepcionBunker");
const ContratoBunker = require("../../models/bunker/contratoBunker");

// Obtener todas las recepcionBunkers con paginación y población de referencias
const recepcionBunkerGets = async (req = request, res = response) => {
  const query = {};

  try {
    const [total, recepcionBunkers] = await Promise.all([
      RecepcionBunker.countDocuments(query),
      RecepcionBunker.find(query)
        .populate({
          path: "idContrato",
          select: "idBunker idContacto idItems numeroContrato",
          populate: [
            { path: "idBunker", select: "nombre" },
            { path: "idContacto", select: "nombre" },
            { path: "idItems" },
          ],
        })
        .populate("idBunker", "nombre")
        .populate("idLinea", "nombre")
        .populate("idTanque", "nombre")
        .populate("idContratoItems"),
    ]);

    res.json({
      total,
      recepcionBunkers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una recepción específica por ID

const recepcionBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const recepcionBunkerActualizada = await RecepcionBunker.findById(id)
      .populate({
        path: "idContrato",
        select: "idBunker idContacto idItems numeroContrato",
        populate: [
          { path: "idBunker", select: "nombre" },
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
        path: "idBunker",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
        // Eliminamos el path idTanque ya que no es necesario poblarlo dos veces
      });

    if (recepcionBunkerActualizada) {
      res.json(recepcionBunkerActualizada);
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
const recepcionBunkerPost = async (req, res = response) => {
  const {
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idBunker,
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

  const nuevaRecepcionBunker = new RecepcionBunker({
    // Relaciones con otros modelos
    idContrato,
    idContratoItems,
    idLinea,
    idBunker,
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
    await nuevaRecepcionBunker.save();

    await nuevaRecepcionBunker.populate([
      { path: "idBunker", select: "nombre" },
      {
        path: "idContrato",
        select: "numeroContrato idBunker idContacto idItems",
        populate: [
          { path: "idBunker", select: "nombre" },
          { path: "idContacto", select: "nombre" },
          { path: "idItems" },
        ],
      },
      { path: "idLinea", select: "nombre" },
      { path: "idTanque", select: "nombre" },
      { path: "idContratoItems" },
    ]);

    res.json({ recepcionBunker: nuevaRecepcionBunker });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una recepción existente
const recepcionBunkerPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const recepcionBunkerActualizada = await RecepcionBunker.findByIdAndUpdate(id, resto, {
      new: true,
    })
      .populate({
        path: "idContrato",
        select: "idBunker idContacto idItems numeroContrato",
        populate: [
          { path: "idBunker", select: "nombre" },
          { path: "idContacto", select: "nombre" },
          { path: "idItems" },
        ],
      })
      .populate("idBunker", "nombre")
      .populate("idLinea", "nombre")
      .populate("idTanque", "nombre")
      .populate("idContratoItems");
    // .populate({
    //   path: "idContrato",
    //   select: "idBunker idContacto idContratoItems numeroContrato",
    //   populate: [
    //     { path: "idBunker", select: "nombre" },
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
    //   path: "idBunker",
    //   select: "nombre",
    //   populate: { path: "idBunker", select: "nombre" },
    // });
    if (!recepcionBunkerActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }
    req.io.emit("recepcionBunker-modificada", recepcionBunkerActualizada);
    res.json(recepcionBunkerActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una recepción
const recepcionBunkerDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const recepcionBunker = await RecepcionBunker.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    ).populate({
      path: "idContrato",
      select: "idBunker idContacto",
      populate: [
        { path: "idBunker", select: "nombre" },
        { path: "idContacto", select: "nombre" },
      ],
    });

    if (!recepcionBunker) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }

    res.json(recepcionBunker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const recepcionBunkerPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  recepcionBunkerPost,
  recepcionBunkerGet,
  recepcionBunkerGets,
  recepcionBunkerPut,
  recepcionBunkerDelete,
  recepcionBunkerPatch,
};
