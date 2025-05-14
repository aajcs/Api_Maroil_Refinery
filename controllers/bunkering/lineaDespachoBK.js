const { response, request } = require("express");
const LineaDespachoBK = require("../../models/bunkering/lineaDespachoBK");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idMuelle", select: "nombre" },
  { path: "idProducto", select: "nombre" },
];

// Obtener todas las líneas de despacho
const lineaDespachoBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, lineas] = await Promise.all([
      LineaDespachoBK.countDocuments(query),
      LineaDespachoBK.find(query).populate(populateOptions).sort({ nombre: 1 }),
    ]);
    res.json({ total, lineas });
  } catch (err) {
    console.error("Error en lineaDespachoBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las líneas de despacho.",
    });
  }
};

// Obtener una línea de despacho por ID
const lineaDespachoBKGet = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const linea = await LineaDespachoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!linea) {
      return res.status(404).json({ msg: "Línea de despacho no encontrada" });
    }

    res.json(linea);
  } catch (err) {
    console.error("Error en lineaDespachoBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la línea de despacho.",
    });
  }
};

// Crear una nueva línea de despacho
const lineaDespachoBKPost = async (req = request, res = response) => {
  try {
    const data = req.body;
    data.createdBy = req.usuario?._id; // Si usas auditoría de usuario

    const nuevaLinea = new LineaDespachoBK(data);
    await nuevaLinea.save();
    await nuevaLinea.populate(populateOptions);

    res.status(201).json(nuevaLinea);
  } catch (err) {
    console.error("Error en lineaDespachoBKPost:", err);
    let errorMsg = "Error interno del servidor al crear la línea de despacho.";
    if (err.code === 11000) {
      errorMsg = "Ya existe una línea de despacho con ese nombre en el muelle.";
    }
    res.status(500).json({ error: errorMsg });
  }
};

// Actualizar una línea de despacho existente
const lineaDespachoBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await LineaDespachoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Línea de despacho no encontrada" });
    }
    const cambios = {};
    for (let key in resto) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const lineaActualizada = await LineaDespachoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!lineaActualizada) {
      return res.status(404).json({ msg: "Línea de despacho no encontrada" });
    }

    res.json(lineaActualizada);
  } catch (err) {
    console.error("Error en lineaDespachoBKPut:", err);
    let errorMsg = "Error interno del servidor al actualizar la línea de despacho.";
    if (err.code === 11000) {
      errorMsg = "Ya existe una línea de despacho con ese nombre en el muelle.";
    }
    res.status(500).json({ error: errorMsg });
  }
};

// Eliminar (marcar como eliminada) una línea de despacho
const lineaDespachoBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await LineaDespachoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Línea de despacho no encontrada" });
    }
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const lineaEliminada = await LineaDespachoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!lineaEliminada) {
      return res.status(404).json({ msg: "Línea de despacho no encontrada" });
    }

    res.json({
      msg: "Línea de despacho eliminada correctamente.",
      linea: lineaEliminada,
    });
  } catch (err) {
    console.error("Error en lineaDespachoBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la línea de despacho.",
    });
  }
};

module.exports = {
  lineaDespachoBKGets,
  lineaDespachoBKGet,
  lineaDespachoBKPost,
  lineaDespachoBKPut,
  lineaDespachoBKDelete,
};