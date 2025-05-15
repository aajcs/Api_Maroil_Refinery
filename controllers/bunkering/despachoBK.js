const { response, request } = require("express");
const DespachoBK = require("../../models/bunkering/despachoBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato",
    select: "idItems numeroContrato",
    populate: {
      path: "idItems",
      populate: [
        { path: "producto", select: "nombre" },
        { path: "idTipoProducto", select: "nombre" },
      ],
    },
  },
  { path: "idChequeoCalidad" },
  { path: "idChequeoCantidad" },
  { path: "idMuelle", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idLinea", select: "nombre" },
  {
    path: "idContratoItems",
    populate: {
      path: "producto",
      select: "nombre",
    },
  },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todos los despachos con población de referencias
const despachoBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, despachos] = await Promise.all([
      DespachoBK.countDocuments(query),
      DespachoBK.find(query).populate(populateOptions),
    ]);
    despachos.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({
      total,
      despachos,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un despacho específica por ID
const despachoBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const despachoActualizada = await DespachoBK.findById(id).populate(populateOptions);
    if (despachoActualizada && Array.isArray(despachoActualizada.historial)) {
      despachoActualizada.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    if (despachoActualizada) {
      res.json(despachoActualizada);
    } else {
      res.status(404).json({
        msg: "Despacho no encontrado",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo despacho
const despachoBKPost = async (req, res = response) => {
  const {
    idContrato,
    idContratoItems,
    idLinea,
    idMuelle,
    idTanque,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoDespacho,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioDespacho,
    fechaFinDespacho,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    idGuia,
    placa,
    tipo,
    nombreChofer,
  } = req.body;

  const nuevaDespacho = new DespachoBK({
    idContrato,
    idContratoItems,
    idLinea,
    idMuelle,
    idTanque,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoDespacho,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioDespacho,
    fechaFinDespacho,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    idGuia,
    placa,
    tipo,
    nombreChofer,
    createdBy: req.usuario._id,
  });

  try {
    await nuevoDespacho.save();
    await nuevoDespacho.populate(populateOptions);
    res.json({ despacho: nuevoDespacho });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un despacho existente
const despachoBKPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await DespachoBK.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }
    const despachoActualizada = await DespachoBK.findByIdAndUpdate(
      id,
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!despachoActualizada) {
      return res.status(404).json({
        msg: "Despacho no encontrada",
      });
    }
    req.io?.emit("despacho-modificada", despachoActualizada);
    res.json(despachoActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un Despacho
const despachoBKDelete = async (req, res = response) => {
  const { id } = req.params;
  try {
    const antes = await DespachoBK.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };
    const despacho = await DespachoBK.findByIdAndUpdate(
      id,
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!despacho) {
      return res.status(404).json({
        msg: "Despacho no encontrada",
      });
    }

    res.json(despacho);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const despachoBKPatch = (req, res = response) => {
  res.json({
    msg: "patch API - despachoBKPatch",
  });
};

module.exports = {
  despachoBKPost,
  despachoBKGet,
  despachoBKGets,
  despachoBKPut,
  despachoBKDelete,
  despachoBKPatch,
};