// Importaciones necesarias
const { response, request } = require("express");
const Ventana = require("../models/ventana");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  {
    path: "compra",
    populate: {
      path: "idItems",
      populate: {
        path: "producto",
      },
    },
  },
  {
    path: "venta",
    populate: {
      path: "idItems",
      populate: {
        path: "producto",
      },
    },
  },
  { path: "gasto" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Controlador para obtener todas las ventanas
const ventanaGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, ventanas] = await Promise.all([
      Ventana.countDocuments(query),
      Ventana.find(query).populate(populateOptions),
    ]);

    // Ordenar historial por fecha descendente en cada ventana
    ventanas.forEach((v) => {
      if (Array.isArray(v.historial)) {
        v.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });

    res.json({ total, ventanas });
  } catch (err) {
    console.error("Error en ventanaGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las ventanas.",
    });
  }
};

// Controlador para obtener una ventana específica por ID
const ventanaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const ventana = await Ventana.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!ventana) {
      return res.status(404).json({ msg: "Ventana no encontrada." });
    }

    // Ordenar historial por fecha descendente
    if (Array.isArray(ventana.historial)) {
      ventana.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    res.json(ventana);
  } catch (err) {
    console.error("Error en ventanaGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la ventana.",
    });
  }
};

// Controlador para crear una nueva ventana
const ventanaPost = async (req = request, res = response) => {
  const {
    idRefineria,
    compra,
    venta,
    gasto,
    maquila,
    monto,
    fechaInicio,
    fechaFin,
    estadoVentana,
  } = req.body;

  try {
    const nuevaVentana = new Ventana({
      idRefineria,
      compra,
      venta,
      gasto,
      maquila,
      monto,
      fechaInicio,
      fechaFin,
      estadoVentana,
      createdBy: req.usuario._id,
    });

    await nuevaVentana.save();
    await nuevaVentana.populate(populateOptions);

    res.status(201).json(nuevaVentana);
  } catch (err) {
    console.error("Error en ventanaPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear la ventana.",
    });
  }
};

// Controlador para actualizar una ventana existente
const ventanaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await Ventana.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Ventana no encontrada." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const ventanaActualizada = await Ventana.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!ventanaActualizada) {
      return res.status(404).json({ msg: "Ventana no encontrada." });
    }

    res.json(ventanaActualizada);
  } catch (err) {
    console.error("Error en ventanaPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la ventana.",
    });
  }
};

// Controlador para eliminar (marcar como eliminada) una ventana
const ventanaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await Ventana.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Ventana no encontrada." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const ventanaEliminada = await Ventana.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!ventanaEliminada) {
      return res.status(404).json({ msg: "Ventana no encontrada." });
    }

    res.json(ventanaEliminada);
  } catch (err) {
    console.error("Error en ventanaDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la ventana.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const ventanaPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const ventanaActualizada = await Ventana.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!ventanaActualizada) {
      return res.status(404).json({ msg: "Ventana no encontrada." });
    }

    res.json(ventanaActualizada);
  } catch (err) {
    console.error("Error en ventanaPatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente la ventana.",
    });
  }
};

// Exporta los controladores
module.exports = {
  ventanaGets,
  ventanaGet,
  ventanaPost,
  ventanaPut,
  ventanaDelete,
  ventanaPatch,
};
