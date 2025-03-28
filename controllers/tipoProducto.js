// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const TipoProducto = require("../models/tipoProducto"); // Modelo TipoProducto para interactuar con la base de datos
const { Producto } = require("../models"); // Modelo Producto para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idProducto", // Relación con el modelo Producto
    select: "nombre color", // Selecciona solo los campos nombre y color
  },
  {
    path: "idRefineria", // Relación con el modelo Refineria
    select: "nombre", // Selecciona solo el campo nombre
  },
  {
    path: "rendimientos.idProducto", // Población dentro del array de rendimientos
    select: "nombre", // Incluye solo el campo nombre del producto
  },
];

// Controlador para obtener todos los tipos de producto con paginación y población de referencias
const tipoProductoGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false }; // Filtro para obtener solo tipos de producto activos y no eliminados

  try {
    // Ejecuta ambas consultas en paralelo para optimizar el tiempo de respuesta
    const [total, tipoProductos] = await Promise.all([
      TipoProducto.countDocuments(query), // Cuenta el total de tipos de producto que cumplen el filtro
      TipoProducto.find(query).populate(populateOptions), // Obtiene los tipos de producto con las referencias pobladas
    ]);

    // Responde con el total de tipos de producto y la lista obtenida
    res.json({
      total,
      tipoProductos,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener un tipo de producto específico por ID
const tipoProductoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del tipo de producto desde los parámetros de la URL

  try {
    // Busca el tipo de producto por ID y verifica que esté activo y no eliminado
    const tipoProducto = await TipoProducto.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Población de referencias

    if (!tipoProducto) {
      return res.status(404).json({ msg: "Tipo de Producto no encontrado" }); // Responde con un error 404 si no se encuentra el tipo de producto
    }

    res.json(tipoProducto); // Responde con los datos del tipo de producto
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear un nuevo tipo de producto
const tipoProductoPost = async (req = request, res = response) => {
  // Extrae los datos del cuerpo de la solicitud
  const {
    idRefineria,
    idProducto,
    nombre,
    clasificacion,
    rendimientos,
    gravedadAPI,
    azufre,
    contenidoAgua,
    flashPoint,
  } = req.body;

  try {
    // Crea una nueva instancia del modelo TipoProducto con los datos proporcionados
    const nuevoTipoProducto = new TipoProducto({
      idRefineria,
      idProducto,
      nombre,
      clasificacion,
      rendimientos,
      gravedadAPI,
      azufre,
      contenidoAgua,
      flashPoint,
    });

    await nuevoTipoProducto.save(); // Guarda el nuevo tipo de producto en la base de datos

    // Actualiza el modelo Producto para agregar la referencia al nuevo tipo de producto
    await Producto.findByIdAndUpdate(
      idProducto,
      { $push: { idTipoProducto: nuevoTipoProducto._id } }, // Agrega el ID del nuevo tipo de producto al campo idTipoProducto
      { new: true }
    );

    await nuevoTipoProducto.populate(populateOptions); // Población de referencias para la respuesta
    res.status(201).json(nuevoTipoProducto); // Responde con un código 201 (creado) y los datos del tipo de producto
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para actualizar un tipo de producto existente
const tipoProductoPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del tipo de producto desde los parámetros de la URL
  const { idProducto, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo idProducto

  try {
    // Actualiza el tipo de producto en la base de datos y devuelve el tipo de producto actualizado
    const tipoProductoActualizado = await TipoProducto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el tipo de producto no eliminado
      { ...resto, idProducto }, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Población de referencias

    if (!tipoProductoActualizado) {
      return res.status(404).json({ msg: "Tipo de Producto no encontrado" }); // Responde con un error 404 si no se encuentra el tipo de producto
    }

    // Si se proporciona un nuevo idProducto, actualiza las referencias en la colección Producto
    if (idProducto) {
      await Producto.updateMany(
        { idTipoProducto: id }, // Encuentra todos los productos que referencian el tipo de producto
        { $pull: { idTipoProducto: id } } // Elimina la referencia al tipo de producto
      );

      await Producto.findByIdAndUpdate(
        idProducto,
        { $push: { idTipoProducto: id } }, // Agrega la nueva referencia al tipo de producto
        { new: true }
      );
    }

    res.json(tipoProductoActualizado); // Responde con los datos del tipo de producto actualizado
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(400).json({ error: err.message }); // Responde con un error 400 y el mensaje del error
  }
};

// Controlador para eliminar (marcar como eliminado) un tipo de producto
const tipoProductoDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del tipo de producto desde los parámetros de la URL

  try {
    // Marca el tipo de producto como eliminado (eliminación lógica)
    const tipoProducto = await TipoProducto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el tipo de producto no eliminado
      { eliminado: true }, // Marca el tipo de producto como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Población de referencias

    if (!tipoProducto) {
      return res.status(404).json({ msg: "Tipo de Producto no encontrado" }); // Responde con un error 404 si no se encuentra el tipo de producto
    }

    // Elimina la referencia al tipo de producto en la colección Producto
    await Producto.updateMany(
      { idTipoProducto: id }, // Encuentra todos los productos que referencian el tipo de producto
      { $pull: { idTipoProducto: id } } // Elimina la referencia al tipo de producto
    );

    res.json(tipoProducto); // Responde con los datos del tipo de producto eliminado
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const tipoProductoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - tipoProductoPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  tipoProductoGets, // Obtener todos los tipos de producto
  tipoProductoGet, // Obtener un tipo de producto específico por ID
  tipoProductoPost, // Crear un nuevo tipo de producto
  tipoProductoPut, // Actualizar un tipo de producto existente
  tipoProductoDelete, // Eliminar (marcar como eliminado) un tipo de producto
  tipoProductoPatch, // Manejar solicitudes PATCH
};
