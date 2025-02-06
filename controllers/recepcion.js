const { response, request } = require("express");
const Recepcion = require("../models/recepcion");
const Contrato = require("../models/contrato");

// Obtener todas las recepciones con paginación y población de referencias
const recepcionGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, recepciones] = await Promise.all([
      Recepcion.countDocuments(query),
      Recepcion.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate('id_contrato')
    ]);

    // Poblar id_refineria e id_contacto de cada recepción
    await Promise.all(recepciones.map(async (recepcion) => {
      await recepcion.populate({
      path: 'id_contrato',
      select: 'id_refineria id_contacto',
      populate: [
        { path: 'id_refineria', select: 'nombre' },
        { path: 'id_contacto', select: 'nombre' }
    ]}).execPopulate();
    }));

    res.json({
      total,
      recepciones,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

   
// Obtener una recepción específica por ID
const recepcionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const recepcionActualizado = await Recepcion.findById(id).populate({
      path: 'id_contrato',
      select: 'id_refineria id_contacto',
      populate: [
        { path: 'id_refineria', select: 'nombre' },
        { path: 'id_contacto', select: 'nombre' }
    ]})
    

    if (recepcionActualizado) {
      res.json(recepcionActualizado);
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
    contrato,
    cantidadRecibida,
    precioUnitario,
    montoTotal,
    estado,
    fechaRecepcion,
    hora,
    id_lote,
    id_contrato,
    id_linea,
    id_tanque,
    id_guia,
    placa,
    nombre_chofer,
    apellido_chofer,
  } = req.body;

  const nuevaRecepcion = new Recepcion({
    contrato,
    cantidadRecibida,
    precioUnitario,
    montoTotal,
    estado,
    fechaRecepcion,
    hora,
    id_lote,
    id_contrato,
    id_linea,
    id_tanque,
    id_guia,
    placa,
    nombre_chofer,
    apellido_chofer,
  });

  try {
    await nuevaRecepcion.save();
    
    await nuevaRecepcion.populate({
      path: 'id_contrato',
      select: 'id_refineria id_contacto',
      populate: [
        { path: 'id_refineria', select: 'nombre' },
        { path: 'id_contacto', select: 'nombre' }
    ]}).execPopulate(),
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
      path: 'id_contrato',
      select: 'id_refineria id_contacto',
      populate: [
        { path: 'id_refineria', select: 'nombre' },
        { path: 'id_contacto', select: 'nombre' }
    ]})
    if (!recepcionActualizada) {
      return res.status(404).json({
        msg: "Recepción no encontrada",
      });
    }

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
        path: 'id_contrato',
        select: 'id_refineria id_contacto',
        populate: [
          { path: 'id_refineria', select: 'nombre' },
          { path: 'id_contacto', select: 'nombre' }
      ]});
  
      if (!recepcion) {
        return res.status(404).json({
          msg: "Recepcion no encontrado",
        });
      }
  
      res.json(recepcion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

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
