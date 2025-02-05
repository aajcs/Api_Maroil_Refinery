const { response, request } = require("express");
const Contacto = require("../models/contacto");

const contactoGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, contactos] = await Promise.all([
    Contacto.countDocuments(query),
    Contacto.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("id_refineria", "nombre"),
  ]);

  res.json({
    total,
    contactos,
  });
};

const contactoGet = async (req = request, res = response) => {
  const { id } = req.params;
  const contacto = await Contacto.findById(id).populate(
    "id_refineria",
    "nombre"
  );

  if (contacto && !contacto.eliminado) {
    res.json(contacto);
  } else {
    res.status(404).json({
      msg: "Contacto no encontrado o eliminado",
    });
  }
};

const contactoPost = async (req, res = response) => {
  const {
    nombre,
    identificacionFiscal,
    correo,
    direccion,
    telefono,
    tipo,
    id_refineria,
    representanteLegal,
    estado,
    eliminado,
  } = req.body;
  const contacto = new Contacto({
    nombre,
    identificacionFiscal,
    correo,
    direccion,
    telefono,
    tipo,
    id_refineria,
    representanteLegal,
    estado,
    eliminado,
  });

  try {
    await contacto.save();
    await contacto.populate("id_refineria", "nombre").execPopulate();
    res.json({
      contacto,
    });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const contactoPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;
  const contacto = await Contacto.findByIdAndUpdate(id, resto, {
    new: true,
  }).populate("id_refineria", "nombre");

  res.json(contacto);
};

const contactoDelete = async (req, res = response) => {
  const { id } = req.params;
  const contacto = await Contacto.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(contacto);
};

const contactoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  contactoPost,
  contactoGet,
  contactoGets,
  contactoPut,
  contactoDelete,
  contactoPatch,
};
