const { response, request } = require("express");
const ProductoBunker = require("../../models/bunker/productoBunker");

// Obtener todos los productoBunkers con paginación y población de referencias
const populateOptions = [
  {
    path: "idBunker",
    select: "nombre",
  },
];
const productoBunkerGets = async (req = request, res = response) => {
  const query = { estado: true };

  try {
    const [total, productoBunkers] = await Promise.all([
      ProductoBunker.countDocuments(query),
      ProductoBunker.find(query).populate(populateOptions).sort({ posicion: 1 }),
    ]);

    res.json({
      total,
      productoBunkers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un productoBunker específico por ID
const productoBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const productoBunker = await ProductoBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!productoBunker) {
      return res.status(404).json({ msg: "ProductoBunker no encontrado" });
    }

    res.json(productoBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo productoBunker
const productoBunkerPost = async (req = request, res = response) => {
  try {
    const { nombre, idBunker, posicion, color, estado, tipoProductoBunker } =
      req.body;

    if (!nombre || !idBunker) {
      return res
        .status(400)
        .json({ error: "Nombre y Refinería son requeridos" });
    }

    const nuevoProductoBunker = new ProductoBunker({
      nombre,
      idBunker,
      posicion,
      color,
      estado,
      tipoProductoBunker,
    });
    await nuevoProductoBunker.save();
    await nuevoProductoBunker.populate(populateOptions);

    res.status(201).json(nuevoProductoBunker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un productoBunker existente
const productoBunkerPut = async (req, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;
  try {
    const productoBunkerActualizado = await ProductoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!productoBunkerActualizado) {
      return res.status(404).json({ msg: "ProductoBunker no encontrado" });
    }

    res.json(productoBunkerActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un productoBunker
const productoBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const productoBunker = await ProductoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!productoBunker) {
      return res.status(404).json({ msg: "ProductoBunker no encontrado" });
    }

    res.json(productoBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un productoBunker (ejemplo básico)
const productoBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - productoBunkerPatch",
  });
};

module.exports = {
  productoBunkerPost,
  productoBunkerGet,
  productoBunkerGets,
  productoBunkerPut,
  productoBunkerDelete,
  productoBunkerPatch,
};
