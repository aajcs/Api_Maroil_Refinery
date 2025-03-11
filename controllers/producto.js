const { response, request } = require("express");
const Producto = require("../models/producto");

// Obtener todos los productos con paginación y población de referencias
const populateOptions = [
  {
    path: "idRefineria",
    select: "nombre",
  },
];
const productoGets = async (req = request, res = response) => {
  const query = { estado: true };

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query).populate(populateOptions).sort({ posicion: 1 }),
    ]);

    res.json({
      total,
      productos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un producto específico por ID
const productoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo producto
const productoPost = async (req = request, res = response) => {
  try {
    const { nombre, idRefineria, posicion, color, estado } = req.body;

    if (!nombre || !idRefineria) {
      return res
        .status(400)
        .json({ error: "Nombre y Refinería son requeridos" });
    }

    const nuevoProducto = new Producto({
      nombre,
      idRefineria,
      posicion,
      color,
      estado,
    });
    await nuevoProducto.save();
    await nuevoProducto.populate(populateOptions);

    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un producto existente
const productoPut = async (req, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;
  try {
    const productoActualizado = await Producto.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!productoActualizado) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un producto
const productoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un producto (ejemplo básico)
const productoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - productoPatch",
  });
};

module.exports = {
  productoPost,
  productoGet,
  productoGets,
  productoPut,
  productoDelete,
  productoPatch,
};
