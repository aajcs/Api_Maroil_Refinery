const { response, request } = require("express");
const ProductoBK = require("../../models/bunkering/productoBK");
const TipoProductoBK = require("../../models/bunkering/tipoProductoBK");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  { path: "idTipoProducto", select: "nombre" },
];

// Obtener todos los productos
const productoBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, productos] = await Promise.all([
      ProductoBK.countDocuments(query),
      ProductoBK.find(query).populate(populateOptions).sort({ nombre: 1 }),
    ]);
    res.json({ total, productos });
  } catch (err) {
    console.error("Error en productoBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los productos.",
    });
  }
};

// Obtener un producto por ID
const productoBKGet = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const producto = await ProductoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (err) {
    console.error("Error en productoBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el producto.",
    });
  }
};

// Crear un nuevo producto
const productoBKPost = async (req = request, res = response) => {
  try {
    const data = req.body;
    data.createdBy = req.usuario?._id; // Si usas auditoría de usuario

    const nuevoProducto = new ProductoBK(data);
    await nuevoProducto.save();
    await nuevoProducto.populate(populateOptions);

    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error("Error en productoBKPost:", err);
    let errorMsg = "Error interno del servidor al crear el producto.";
    if (err.code === 11000) {
      errorMsg = "Ya existe un producto con ese nombre o posición en el bunkering.";
    }
    res.status(500).json({ error: errorMsg });
  }
};

// Actualizar un producto existente
const productoBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await ProductoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }
    const cambios = {};
    for (let key in resto) {
      if (JSON.stringify(antes[key]) !== JSON.stringify(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const productoActualizado = await ProductoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!productoActualizado) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (err) {
    console.error("Error en productoBKPut:", err);
    let errorMsg = "Error interno del servidor al actualizar el producto.";
    if (err.code === 11000) {
      errorMsg = "Ya existe un producto con ese nombre o posición en el bunkering.";
    }
    res.status(500).json({ error: errorMsg });
  }
};

// Eliminar (marcar como eliminado) un producto
const productoBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await ProductoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const productoEliminado = await ProductoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario?._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!productoEliminado) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json({
      msg: "Producto eliminado correctamente.",
      producto: productoEliminado,
    });
  } catch (err) {
    console.error("Error en productoBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el producto.",
    });
  }
};

module.exports = {
  productoBKGets,
  productoBKGet,
  productoBKPost,
  productoBKPut,
  productoBKDelete,
};