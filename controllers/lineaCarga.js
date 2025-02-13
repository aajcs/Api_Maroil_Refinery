const { response, request } = require("express");

const LineaCarga = require("../models/lineaCarga");

const lineaCargaGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, lineaCargas] = await Promise.all([
    LineaCarga.countDocuments(query),
    LineaCarga.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("idRefineria", "nombre"),
  ]);

  res.json({
    total,
    lineaCargas,
  });
};

const lineaCargaGet = async (req = request, res = response) => {
  const { id } = req.params;
  const lineaCarga = await LineaCarga.findById(id).populate(
    "idRefineria",
    "nombre"
  );

  // Verificar si el campo eliminado es falso
  if (lineaCarga && !lineaCarga.eliminado) {
    res.json(lineaCarga);
  } else {
    // Enviar una respuesta apropiada si el lineaCarga no existe o está marcado como eliminado
    res.status(404).json({
      msg: "LineaCarga no encontrado o eliminado",
    });
  }
};

const lineaCargaPost = async (req, res = response) => {
  const { ubicacion, nombre, idRefineria } = req.body;
  const lineaCarga = new LineaCarga({
    ubicacion,
    nombre,
    idRefineria,
  });
  console.log(lineaCarga);
  try {
    // Guardar en BD
    await lineaCarga.save();
    await lineaCarga.populate("idRefineria", "nombre").execPopulate(),
      res.json({
        lineaCarga,
      });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const lineaCargaPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;
  const lineaCarga = await LineaCarga.findByIdAndUpdate(id, resto, {
    new: true,
  }).populate("idRefineria", "nombre");

  res.json(lineaCarga);
};

const lineaCargaDelete = async (req, res = response) => {
  const { id } = req.params;
  const lineaCarga = await LineaCarga.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(lineaCarga);
};

const lineaCargaPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  lineaCargaPost,
  lineaCargaGet,
  lineaCargaGets,
  lineaCargaPut,
  lineaCargaDelete,
  lineaCargaPatch,
};
