const { response, request } = require("express");
const Despacho = require("../models/despacho");

// Obtener todos los despachos con paginación y población de referencias
const despachoGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  try {
    const [total, despachos] = await Promise.all([
      Despacho.countDocuments(query),
      Despacho.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate({
          path: "id_lote",
          select: "nombre",
        })
        .populate({
          path: "id_linea",
          select: "nombre",
        })
        .populate({
          path: "id_empresa",
          select: "nombre",
        }),
    ]);

    res.json({
      total,
      despachos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un despacho específico por ID
const despachoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const despacho = await Despacho.findOne({
      _id: id,
      eliminado: false,
    })
      .populate({
        path: "id_lote",
        select: "nombre",
      })
      .populate({
        path: "id_linea",
        select: "nombre",
      })
      .populate({
        path: "id_empresa",
        select: "nombre",
      });

    if (!despacho) {
      return res.status(404).json({ msg: "Despacho no encontrado" });
    }

    res.json(despacho);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo despacho
const despachoPost = async (req = request, res = response) => {
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

  try {
    const nuevoDespacho = new Despacho({
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

    await nuevoDespacho.save();

    await nuevoDespacho
      .populate({
        path: "id_lote",
        select: "nombre",
      })
      .populate({
        path: "id_linea",
        select: "nombre",
      })
      .populate({
        path: "id_empresa",
        select: "nombre",
      });

    res.status(201).json(nuevoDespacho);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un despacho existente
const despachoPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const despachoActualizado = await Despacho.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    )
      .populate({
        path: "id_lote",
        select: "nombre",
      })
      .populate({
        path: "id_linea",
        select: "nombre",
      })
      .populate({
        path: "id_empresa",
        select: "nombre",
      });

    if (!despachoActualizado) {
      return res.status(404).json({ msg: "Despacho no encontrado" });
    }

    req.io.emit("despacho-modificado", despachoActualizado);
    res.json(despachoActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un despacho
const despachoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const despacho = await Despacho.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    )
      .populate({
        path: "id_lote",
        select: "nombre",
      })
      .populate({
        path: "id_linea",
        select: "nombre",
      })
      .populate({
        path: "id_empresa",
        select: "nombre",
      });

    if (!despacho) {
      return res.status(404).json({ msg: "Despacho no encontrado" });
    }

    res.json(despacho);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un despacho (ejemplo básico)
const despachoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - despachoPatch",
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