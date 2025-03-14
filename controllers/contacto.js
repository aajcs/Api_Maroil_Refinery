const { response, request } = require("express");
const Contacto = require("../models/contacto");

// Opciones de populate reutilizables
const populateOptions = [{ path: "idRefineria", select: "nombre" }];

// Obtener todos los contactos con paginación
const contactoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contactos] = await Promise.all([
      Contacto.countDocuments(query),
      Contacto.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      contactos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un contacto específico por ID
const contactoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contacto = await Contacto.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" });
    }

    res.json(contacto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo contacto
const contactoPost = async (req, res = response) => {
  try {
    const { nombre, idRefineria } = req.body;

    if (!nombre || !idRefineria) {
      return res
        .status(400)
        .json({ error: "Nombre y Refinería son requeridos" });
    }

    const nuevoContacto = await Contacto.create({
      ...req.body,
    });

    await nuevoContacto.populate(populateOptions);

    res.status(201).json(nuevoContacto);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contacto existente
const contactoPut = async (req, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;
  console.log(resto);
  try {
    const contactoActualizado = await Contacto.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!contactoActualizado) {
      return res.status(404).json({ msg: "Contacto no encontrado" });
    }

    res.json(contactoActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contacto
const contactoDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const contacto = await Contacto.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);
    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" });
    }

    res.json(contacto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const contactoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - contactoPatch",
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
