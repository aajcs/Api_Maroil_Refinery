const { response, request } = require("express");
const Contrato_items = require("../models/contrato_items");

// Obtener todos los contrato_itemss con paginación y población de referencias
const contrato_itemsGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  try {
    const [total, contrato_itemss] = await Promise.all([
      Contrato_items.countDocuments(query),
      Contrato_items.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate({ path: "id_contrato", select: "numeroContrato" })
        .populate({ path: "id_refineria", select: "nombre" }),
    ]);

    res.json({
      total,
      contrato_itemss,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un contrato_items específico por ID
const contrato_itemsGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contrato_items = await Contrato_items.findById(id)
      .populate("id_refineria", "nombre")
      .populate("id_contrato", "numeroContrato");

    if (contrato_items && !contrato_items.eliminado) {
      res.json(contrato_items);
    } else {
      res.status(404).json({
        msg: "Contrato_items no encontrado o eliminado",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo contrato_items
const contrato_itemsPost = async (req, res = response) => {
  const {
    id_contrato,
    id_refineria,
    producto,
    cantidad,
    precioUnitario,
    moneda,
    gravedadAPI,
    azufre,
    viscosidad,
    densidad,
    contenidoAgua,
    origen,
    temperatura,
    presion,
  } = req.body;

  const nuevoContrato_items = new Contrato_items({
    id_contrato,
    id_refineria,
    producto,
    cantidad,
    precioUnitario,
    moneda,
    gravedadAPI,
    azufre,
    viscosidad,
    densidad,
    contenidoAgua,
    origen,
    temperatura,
    presion,
  });

  try {
    await nuevoContrato_items.save();
    await nuevoContrato_items
      .populate("id_refineria", "nombre")
      .populate("id_contacto", "nombre")
      .execPopulate();
    res.json({
      nuevoContrato_items,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contrato_items existente
const contrato_itemsPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const contrato_itemsActualizado = await Contrato_items.findByIdAndUpdate(
      id,
      resto,
      {
        new: true,
      }
    )
      .populate("id_refineria", "nombre")
      .populate("id_contacto", "nombre");

    if (!contrato_itemsActualizado) {
      return res.status(404).json({
        msg: "Contrato_items no encontrado",
      });
    }

    res.json(contrato_itemsActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contrato_items
const contrato_itemsDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const contrato_items = await Contrato_items.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    );

    if (!contrato_items) {
      return res.status(404).json({
        msg: "Contrato_items no encontrado",
      });
    }

    res.json(contrato_items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Parchear un contrato_items (ejemplo básico)
const contrato_itemsPatch = (req, res = response) => {
  res.json({
    msg: "patch API - contrato_itemssPatch",
  });
};

module.exports = {
  contrato_itemsPost,
  contrato_itemsGet,
  contrato_itemsGets,
  contrato_itemsPut,
  contrato_itemsDelete,
  contrato_itemsPatch,
};
