const { response, request } = require("express");

const Contrato = require("../models/contrato");

const contratoGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, contratos] = await Promise.all([
    Contrato.countDocuments(query),
    Contrato.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("id_empresa", "nombre"),
  ]);

  res.json({
    total,
    contratos,
  });
};

const contratoGet = async (req = request, res = response) => {
  const { id } = req.params;
  const contrato = await Contrato.findById(id).populate("id_empresa", "nombre");

  // Verificar si el campo eliminado es falso
  if (contrato && !contrato.eliminado) {
    res.json(contrato);
  } else {
    // Enviar una respuesta apropiada si el contrato no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Contrato no encontrado o eliminado",
    });
  }
};

const contratoPost = async (req, res = response) => {
  const {
    producto,
    fecha,
    gravedad,
    azufre,
    viscocidad,
    origen,
    temperatura,
    presion,
    valor,
  } = req.body;
  const contrato = new Contrato({
    producto,
    fecha,
    gravedad,
    azufre,
    viscocidad,
    origen,
    temperatura,
    presion,
    valor,
  });
  console.log(contrato);
  try {
    // Guardar en BD
    await contrato.save();

    res.json({
      contrato,
    });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const contratoPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;
  const contrato = await Contrato.findByIdAndUpdate(id, resto, {
    new: true,
  });

  res.json(contrato);
};

const contratoDelete = async (req, res = response) => {
  const { id } = req.params;
  const contrato = await Contrato.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(contrato);
};

const contratoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  contratoPost,
  contratoGet,
  contratoGets,
  contratoPut,
  contratoDelete,
  contratoPatch,
};
