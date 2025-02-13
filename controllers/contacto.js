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
      .populate("idRefineria", "nombre"),
  ]);

  res.json({
    total,
    contactos,
  });
};

const contactoGet = async (req = request, res = response) => {
  const { id } = req.params;
  const contacto = await Contacto.findById(id).populate(
    "idRefineria",
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
  try {
    const {
      nombre,
      ubicacion,
      infoContacto,
      tipo,
      cuentasBancarias,
      cuentasPorPagar,
      cuentasPorCobrar,
      compras,
      ventas,
      historialModificaciones,
      idRefineria,
    } = req.body;

    const nuevoContacto = new Contacto({
      nombre,
      ubicacion,
      infoContacto,
      tipo,
      cuentasBancarias,
      cuentasPorPagar,
      cuentasPorCobrar,
      compras,
      ventas,
      historialModificaciones,
      idRefineria,
    });

    await nuevoContacto.save();
    await nuevoContacto.populate("idRefineria", "nombre").execPopulate();
    res.json({
      nuevoContacto,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

const contactoPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;
  const contacto = await Contacto.findByIdAndUpdate(id, resto, {
    new: true,
  }).populate("idRefineria", "nombre");

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
