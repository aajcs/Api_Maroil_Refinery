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
      .populate("id_empresa", "nombre"),
  ]);

  res.json({
    total,
    contactos,
  });
};

const contactoGet = async (req = request, res = response) => {
  const { id } = req.params;
  const contacto = await Contacto.findById(id).populate("id_empresa", "nombre");

  // Verificar si el campo eliminado es falso
  if (contacto && !contacto.eliminado) {
    res.json(contacto);
  } else {
    // Enviar una respuesta apropiada si el contacto no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Contacto no encontrado o eliminado",
    });
  }
};

const contactoPost = async (req, res = response) => {
  const { nombre, correo, direccion, telefono, tipo } = req.body;
  const contacto = new Contacto({
    nombre,
    correo,
    direccion,
    telefono,
    tipo,
  });
  console.log(contacto);
  try {
    // Guardar en BD
    await contacto.save();

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
  });

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
