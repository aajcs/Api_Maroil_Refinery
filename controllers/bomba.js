const { response, request } = require("express");

const Bomba = require("../models/bomba");

// Opciones de populate reutilizables
const populateOptions = [{ path: "idRefineria", select: "nombre" }];

const bombaGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  const [total, bombas] = await Promise.all([
    Bomba.countDocuments(query),
    Bomba.find(query).populate(populateOptions),
  ]);

  res.json({
    total,
    bombas,
  });
};

const bombaGet = async (req = request, res = response) => {
  const { id } = req.params;
  const bomba = await Bomba.findById(id).populate("idRefineria", "nombre");

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
  const { idRefineria, ubicacion, apertura, rpm, caudal } = req.body;
  const bomba = new Bomba({
    idRefineria,
    ubicacion,
    apertura,
    rpm,
    caudal,
  });
  console.log(bomba);
  try {
    // Guardar en BD
    await bomba.save();
    await bomba.populate(populateOptions).execPopulate();
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
  }).populate(populateOptions);

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
