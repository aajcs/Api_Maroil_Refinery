const { response, request } = require("express");
const Barcaza = require("../models/barcaza");

const populateOptions = [
  {
    path: "idBunker",
    select: "nombre",
  },
  { path: "idProducto", select: "nombre color" },
];

// Obtener todos los barcazas con paginación y población de referencias
const barcazaGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, barcazas] = await Promise.all([
      Barcaza.countDocuments(query),
      Barcaza.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      barcazas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un barcaza específico por ID
const barcazaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const barcaza = await Barcaza.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!barcaza) {
      return res.status(404).json({ msg: "Barcaza no encontrado" });
    }

    res.json(barcaza);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo barcaza
const barcazaPost = async (req = request, res = response) => {
  const {
    nombre,
    ubicacion,
    capacidad,
    material,
    almacenamiento,
    almacenamientoMateriaPrimaria,
    idBunker,
    idProducto,
  } = req.body;

  try {
    const nuevoBarcaza = new Barcaza({
      nombre,
      ubicacion,
      capacidad,
      material,
      almacenamiento,
      almacenamientoMateriaPrimaria,
      idBunker,
      idProducto,
    });

    await nuevoBarcaza.save();

    await nuevoBarcaza.populate(populateOptions);

    res.status(201).json(nuevoBarcaza);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un barcaza existente
const barcazaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const barcazaActualizado = await Barcaza.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!barcazaActualizado) {
      return res.status(404).json({ msg: "Barcaza no encontrado" });
    }

    res.json(barcazaActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un barcaza
const barcazaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const barcaza = await Barcaza.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!barcaza) {
      return res.status(404).json({ msg: "Barcaza no encontrado" });
    }

    res.json(barcaza);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un barcaza (ejemplo básico)
const barcazaPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - barcazaPatch",
  });
};

module.exports = {
  barcazaPost,
  barcazaGet,
  barcazaGets,
  barcazaPut,
  barcazaDelete,
  barcazaPatch,
};
