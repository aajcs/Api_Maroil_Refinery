const { response, request } = require("express");
const LineaCargaBK = require("../../models/bunkering/lineaCargaBK");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  { path: "idMuelle", select: "nombre" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todas las líneas de carga
const lineaCargaBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, lineaCargas] = await Promise.all([
      LineaCargaBK.countDocuments(query),
      LineaCargaBK.find(query).populate(populateOptions).sort({ nombre: 1 }),
    ]);
    lineaCargas.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    res.json({ total, lineaCargas });
  } catch (err) {
    console.error("Error en lineaCargaBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las líneas de carga.",
    });
  }
};

// Obtener una línea de carga por ID
const lineaCargaBKGet = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const lineaCarga = await LineaCargaBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);
    lineaCarga.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    if (!lineaCarga) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaCarga);
  } catch (err) {
    console.error("Error en lineaCargaBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la línea de carga.",
    });
  }
};

// Crear una nueva línea de carga
const lineaCargaBKPost = async (req = request, res = response) => {
  try {
    const data = req.body;
    data.createdBy = req.usuario?._id; // Si usas auditoría de usuario

    const nuevaLinea = new LineaCargaBK(data);
    await nuevaLinea.save();
    await nuevaLinea.populate(populateOptions);

    res.status(201).json(nuevaLinea);
  } catch (err) {
    console.error("Error en lineaCargaBKPost:", err);
    let errorMsg = "Error interno del servidor al crear la línea de carga.";
    if (err.code === 11000) {
      errorMsg = "Ya existe una línea de carga con ese nombre en el muelle.";
    }
    res.status(500).json({ error: errorMsg });
  }
};

// Actualizar una línea de carga existente
const lineaCargaBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await LineaCargaBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }
    const cambios = {};
    for (let key in resto) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const lineaActualizada = await LineaCargaBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!lineaActualizada) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json(lineaActualizada);
  } catch (err) {
    console.error("Error en lineaCargaBKPut:", err);
    let errorMsg =
      "Error interno del servidor al actualizar la línea de carga.";
    if (err.code === 11000) {
      errorMsg = "Ya existe una línea de carga con ese nombre en el muelle.";
    }
    res.status(500).json({ error: errorMsg });
  }
};

// Eliminar (marcar como eliminada) una línea de carga
const lineaCargaBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await LineaCargaBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const lineaEliminada = await LineaCargaBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!lineaEliminada) {
      return res.status(404).json({ msg: "Línea de carga no encontrada" });
    }

    res.json({
      msg: "Línea de carga eliminada correctamente.",
      linea: lineaEliminada,
    });
  } catch (err) {
    console.error("Error en lineaCargaBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la línea de carga.",
    });
  }
};

module.exports = {
  lineaCargaBKGets,
  lineaCargaBKGet,
  lineaCargaBKPost,
  lineaCargaBKPut,
  lineaCargaBKDelete,
};
