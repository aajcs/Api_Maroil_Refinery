// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Producto = require("../models/producto"); // Modelo Producto para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idRefineria", // Relación con el modelo Refineria
    select: "nombre", // Selecciona el campo nombre
  },
  { path: "idTipoProducto" }, // Relación con el modelo TipoProducto
];

// Controlador para obtener todos los productos con población de referencias
const productoGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo productos no eliminados

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query), // Cuenta el total de productos
      Producto.find(query).populate(populateOptions).sort({ posicion: 1 }), // Obtiene los productos con referencias pobladas y los ordena por posición
    ]);

    res.json({
      total,
      productos,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener un producto específico por ID
const productoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del producto desde los parámetros de la URL

  try {
    const producto = await Producto.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Busca el producto por ID y popula las referencias

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" }); // Responde con un error 404 si no se encuentra el producto
    }

    res.json(producto); // Responde con los datos del producto
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear un nuevo producto
const productoPost = async (req = request, res = response) => {
  try {
    const { nombre, idRefineria, posicion, color, estado, tipoMaterial } =
      req.body; // Extrae los datos del cuerpo de la solicitud

    if (!nombre || !idRefineria) {
      return res
        .status(400)
        .json({ error: "Nombre y Refinería son requeridos" }); // Valida que los campos obligatorios estén presentes
    }

    const nuevoProducto = new Producto({
      nombre,
      idRefineria,
      posicion,
      color,
      estado,
      tipoMaterial,
    });

    await nuevoProducto.save(); // Guarda el nuevo producto en la base de datos
    await nuevoProducto.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevoProducto); // Responde con un código 201 (creado) y los datos del producto
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar un producto existente
const productoPut = async (req, res = response) => {
  const { id } = req.params; // Obtiene el ID del producto desde los parámetros de la URL
  const { ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const productoActualizado = await Producto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el producto no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!productoActualizado) {
      return res.status(404).json({ msg: "Producto no encontrado" }); // Responde con un error 404 si no se encuentra el producto
    }

    res.json(productoActualizado); // Responde con los datos del producto actualizado
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) un producto
const productoDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del producto desde los parámetros de la URL

  try {
    const producto = await Producto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el producto no eliminado
      { eliminado: true }, // Marca el producto como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" }); // Responde con un error 404 si no se encuentra el producto
    }

    res.json(producto); // Responde con los datos del producto eliminado
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const productoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - productoPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  productoPost, // Crear un nuevo producto
  productoGet, // Obtener un producto específico por ID
  productoGets, // Obtener todos los productos
  productoPut, // Actualizar un producto existente
  productoDelete, // Eliminar (marcar como eliminado) un producto
  productoPatch, // Manejar solicitudes PATCH
};
