const { validationResult } = require("express-validator");
const Despacho = require("../models/despacho");

// Obtener todos los despachos
const despachoGets = async (req, res) => {
  try {
    const despachos = await Despacho.find()
      .populate("id_lote")
      .populate("id_linea")
      .populate("id_empresa");
    res.json(despachos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un despacho por ID
const despachoGet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const despacho = await Despacho.findById(req.params.id)
      .populate("id_lote")
      .populate("id_linea")
      .populate("id_empresa");
    if (!despacho)
      return res.status(404).json({ message: "Despacho no encontrado" });
    res.json(despacho);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo despacho

// const createDespacho = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const nuevoDespacho = new Despacho(req.body);
//     try {
//         const despachoGuardado = await nuevoDespacho.save();
//         res.status(201).json(despachoGuardado);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
// Crear una nueva recepción
const despachoPost = async (req, res = response) => {
  const {
    fecha,
    hora,
    id_lote,
    id_linea,
    id_empresa,
    numero_guia,
    placa,
    nombre_chofer,
    apellido_chofer,
  } = req.body;

  const nuevoDespacho = new Despacho({
    // contrato,
    // cantidadRecibida,
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

    fecha,
    hora,
    id_lote,
    id_linea,
    id_empresa,
    numero_guia,
    placa,
    nombre_chofer,
    apellido_chofer,
  });

  try {
    await nuevoDespacho.save();

    await nuevoDespacho
      .populate({
        path: "id_contrato",
        select: "idRefineria id_contacto",
        populate: [
          { path: "idRefineria", select: "nombre" },
          { path: "idContacto", select: "nombre" },
        ],
      })
      .populate({
        path: "id_linea",
        select: "nombre",
        populate: { path: "id_linea", select: "nombre" },
      })
      .execPopulate(),
      res.json({ despacho: nuevoDespacho });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Actualizar un despacho existente
const despachoPut = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const despachoActualizado = await Despacho.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!despachoActualizado)
      return res.status(404).json({ message: "Despacho no encontrado" });
    res.json(despachoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un despacho
const despachoDelete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const despacho = await Despacho.findByIdAndDelete(req.params.id);
    if (!despacho)
      return res.status(404).json({ message: "Despacho no encontrado" });
    res.json({ message: "Despacho eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const despachoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  despachoPost,
  despachoGet,
  despachoGets,
  despachoPut,
  despachoDelete,
  despachoPatch,
};
