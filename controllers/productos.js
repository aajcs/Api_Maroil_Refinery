const { response, request } = require("express");
const Producto = require("../models/producto");

// Obtener todos los productos con paginación y población de referencias
const obtenerProductos = async (req = request, res = response) => {
  const query = { estado: true };

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)

        .populate({
          path: "usuario",
          select: "nombre",
        })
        .populate({
          path: "categoria",
          select: "nombre",
        }),
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
const obtenerProducto = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOne({
      _id: id,
      estado: true,
    })
      .populate({
        path: "usuario",
        select: "nombre",
      })
      .populate({
        path: "categoria",
        select: "nombre",
      });

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
const crearProducto = async (req = request, res = response) => {
  const { estado, usuario, ...body } = req.body;

  try {
    const productoDB = await Producto.findOne({
      nombre: body.nombre.toUpperCase(),
    });

    if (productoDB) {
      return res.status(400).json({
        msg: `El producto ${productoDB.nombre} ya existe`,
      });
    }

    const data = {
      ...body,
      nombre: body.nombre.toUpperCase(),
      usuario: req.usuario._id,
    };

    const producto = new Producto(data);
    await producto.save();

    await producto
      .populate({
        path: "usuario",
        select: "nombre",
      })
      .populate({
        path: "categoria",
        select: "nombre",
      });

    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un producto existente
const actualizarProducto = async (req = request, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  try {
    if (data.nombre) {
      data.nombre = data.nombre.toUpperCase();
    }

    data.usuario = req.usuario._id;

    const producto = await Producto.findOneAndUpdate(
      { _id: id, estado: true },
      data,
      { new: true }
    )
      .populate({
        path: "usuario",
        select: "nombre",
      })
      .populate({
        path: "categoria",
        select: "nombre",
      });

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un producto
const borrarProducto = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOneAndUpdate(
      { _id: id, estado: true },
      { estado: false },
      { new: true }
    )
      .populate({
        path: "usuario",
        select: "nombre",
      })
      .populate({
        path: "categoria",
        select: "nombre",
      });

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
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  borrarProducto,
  productoPatch,
};
