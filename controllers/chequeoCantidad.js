const { response, request } = require("express");
const ChequeoCantidad = require("../models/chequeoCantidad");
const { Refinacion } = require("../models");

// Opciones de populate reutilizables
const populateOptions = [
  {
    path: "idProducto",
    select: "nombre",
  },
  {
    path: "idTanque",
    select: "nombre",
  },
  {
    path: "idTorre",
    select: "nombre",
  },
  {
    path: "idRefineria",
    select: "nombre",
  },
  {
    path: "idRefinacion",
    select: "descripcion",
  },
];

// Obtener todos los chequeos de cantidad con paginación y población de referencias
const chequeoCantidadGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, chequeoCantidads] = await Promise.all([
      ChequeoCantidad.countDocuments(query),
      ChequeoCantidad.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      chequeoCantidads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de cantidad específico por ID
const chequeoCantidadGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidad = await ChequeoCantidad.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    })
      .populate({
        path: "idProducto",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      })
      .populate({
        path: "idRefinacion",
        select: "descripcion",
      });

    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoCantidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de cantidad
const chequeoCantidadPost = async (req = request, res = response) => {
  const {
    idProducto,
    idTanque,
    idTorre,
    idRefineria,
    operador,
    fechaChequeo,
    cantidad,
    idRefinacion,
  } = req.body;

  try {
    const nuevoChequeoCantidad = new ChequeoCantidad({
      idProducto,
      idTanque,
      idTorre,
      idRefineria,
      operador,
      fechaChequeo,
      cantidad,
      idRefinacion,
    });

    await nuevoChequeoCantidad.save();

    await Refinacion.findByIdAndUpdate(
      idRefinacion,
      { $push: { idChequeoCantidad: nuevoChequeoCantidad._id } },
      { new: true }
    );

    await nuevoChequeoCantidad.populate(populateOptions);
    res.status(201).json(nuevoChequeoCantidad);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de cantidad existente
const chequeoCantidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idRefinacion, ...resto } = req.body;

  try {
    const chequeoCantidadActualizado = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCantidadActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    if (idRefinacion) {
      await Refinacion.updateMany(
        { idChequedoCantidad: id },
        { $pull: { idChequedoCantidad: id } }
      );

      await Refinacion.findByIdAndUpdate(
        idRefinacion,
        { $push: { idChequedoCantidad: id } },
        { new: true }
      );
    }
    res.json(chequeoCantidadActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCantidadDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidad = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }
    // Eliminar la referencia en la colección de refinación
    await Refinacion.updateMany(
      { idChequeoCantidad: id },
      { $pull: { idChequeoCantidad: id } }
    );

    res.json(chequeoCantidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de calidad (ejemplo básico)
const chequeoCantidadPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCantidadPatch",
  });
};

module.exports = {
  chequeoCantidadGets,
  chequeoCantidadGet,
  chequeoCantidadPost,
  chequeoCantidadPut,
  chequeoCantidadDelete,
  chequeoCantidadPatch,
};
