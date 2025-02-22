const { response, request } = require("express");

const Refineria = require("../models/refineria");

const refineriasGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, refinerias] = await Promise.all([
    Refineria.countDocuments(query),
    Refineria.find(query).skip(Number(desde)).limit(Number(limite)),
  ]);

  res.json({
    total,
    refinerias,
  });
};

const refineriasGet = async (req = request, res = response) => {
  const { id } = req.params;
  const refineria = await Refineria.findById(id);

  // Verificar si el campo eliminado es falso
  if (refineria && !refineria.eliminado) {
    res.json(refineria);
  } else {
    // Enviar una respuesta apropiada si el refineria no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Refineria no encontrado o eliminado",
    });
  }
};

const refineriasPost = async (req, res = response) => {
  const { ubicacion, nombre, nit, img } = req.body;
  const refineria = new Refineria({
    ubicacion,
    nombre,
    nit,
    img,
  });
  try {
    // Guardar en BD
    await refineria.save();

    res.json({
      refineria,
    });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const refineriasPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  const refineria = await Refineria.findByIdAndUpdate(id, resto, { new: true });
  // Emitir evento a todos los clientes conectados
  req.io.emit("refineria-modificada", refineria);
  res.json(refineria);
};

const refineriasDelete = async (req, res = response) => {
  const { id } = req.params;
  const refineria = await Refineria.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(refineria);
};

const refineriasPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  refineriasPost,
  refineriasGet,
  refineriasGets,
  refineriasPut,
  refineriasDelete,
  refineriasPatch,
};
