const { response, request } = require("express");

const Bomba = require("../models/bomba");

const bombaGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, bombas] = await Promise.all([
    Bomba.countDocuments(query),
    Bomba.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("id_refineria", "nombre"),
  ]);

  res.json({
    total,
    bombas,
  });
};

const bombaGet = async (req = request, res = response) => {
  const { id } = req.params;
  const bomba = await Bomba.findById(id).populate("id_refineria", "nombre");

  // Verificar si el campo eliminado es falso
  if (bomba && !bomba.eliminado) {
    res.json(bomba);
  } else {
    // Enviar una respuesta apropiada si el bomba no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Bomba no encontrado o eliminado",
    });
  }
};

const bombaPost = async (req, res = response) => {
  const { id_refineria, ubicacion, apertura, rpm, caudal } = req.body;
  const bomba = new Bomba({
    id_refineria,
    ubicacion,
    apertura,
    rpm,
    caudal,
  });
  console.log(bomba);
  try {
    // Guardar en BD
    await bomba.save();
    await bomba.populate("id_refineria", "nombre"),
      res.json({
        bomba,
      });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const bombaPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  const bomba = await Bomba.findByIdAndUpdate(id, resto, {
    new: true,
  }).populate("id_refineria", "nombre");

  res.json(bomba);
};

const bombaDelete = async (req, res = response) => {
  const { id } = req.params;
  const bomba = await Bomba.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(bomba);
};

const bombaPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  bombaPost,
  bombaGet,
  bombaGets,
  bombaPut,
  bombaDelete,
  bombaPatch,
};
