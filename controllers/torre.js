const { response, request } = require("express");

const Torre = require("../models/torre");

const torreGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, torres] = await Promise.all([
    Torre.countDocuments(query),
    Torre.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("id_refineria", "nombre"),
  ]);

  res.json({
    total,
    torres,
  });
};

const torreGet = async (req = request, res = response) => {
  const { id } = req.params;
  const torre = await Torre.findById(id).populate("id_empresa", "nombre");

  // Verificar si el campo eliminado es falso
  if (torre && !torre.eliminado) {
    res.json(torre);
  } else {
    // Enviar una respuesta apropiada si el torre no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Torre no encontrado o eliminado",
    });
  }
};

const torrePost = async (req, res = response) => {
  const {
    nombre,
    ubicacion,
    capacidad,
    material,
    almacenamiento,
    numero,
    id_refineria,
  } = req.body;
  const torre = new Torre({
    nombre,
    ubicacion,
    capacidad,
    material,
    almacenamiento,
    numero,
    id_refineria,
  });
  console.log(torre);
  try {
    // Guardar en BD
    await torre.save();

    res.json({
      torre,
    });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const torrePut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;
  const torre = await Torre.findByIdAndUpdate(id, resto, {
    new: true,
  });

  res.json(torre);
};

const torreDelete = async (req, res = response) => {
  const { id } = req.params;
  const torre = await Torre.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(torre);
};

const torrePatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  torrePost,
  torreGet,
  torreGets,
  torrePut,
  torreDelete,
  torrePatch,
};
