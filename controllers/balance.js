// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Balance = require("../models/balance"); // Modelo Balance para interactuar con la base de datos
const { selectFields } = require("express-validator/src/select-fields"); // Utilidad para validaciones (no utilizada en este código)

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria, seleccionando solo el campo "nombre"
  { path: "venta", select: "montoTotal" }, // Relación con el modelo Venta, seleccionando el campo "montoTotal"
  { path: "compra", select: "montoTotal" }, // Relación con el modelo Compra, seleccionando el campo "montoTotal"
];

// Controlador para obtener todas las balances con población de referencias
const balanceGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false }; // Filtro para obtener solo balances activos y no eliminados

  try {
    const [total, balances] = await Promise.all([
      Balance.countDocuments(query), // Cuenta el total de balances
      Balance.find(query).populate(populateOptions), // Obtiene los balances con referencias pobladas
    ]);

    if (balances.length === 0) {
      return res.status(404).json({
        message: "No se encontraron balances con los criterios proporcionados.",
      }); // Responde con un error 404 si no se encuentran balances
    }

    res.json({ total, balances }); // Responde con el total y la lista de balances
  } catch (err) {
    console.error("Error en balanceGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      }); // Responde con un error 400 si hay un problema con las referencias
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener las balances.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un balance específico por ID
const balanceGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del balance desde los parámetros de la URL

  try {
    const balance = await Balance.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Busca el balance por ID y popula las referencias

    if (!balance) {
      return res.status(404).json({ msg: "Balance no encontrado" }); // Responde con un error 404 si no se encuentra el balance
    }

    res.json(balance); // Responde con los datos del balance
  } catch (err) {
    console.error("Error en balanceGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balance no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener el balance.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo balance
const balancePost = async (req = request, res = response) => {
  const { idRefineria, compra, venta, montoTotal } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevaBalance = new Balance({
      idRefineria,
      compra,
      venta,
      montoTotal,
    });

    await nuevaBalance.save(); // Guarda el nuevo balance en la base de datos

    await nuevaBalance.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaBalance); // Responde con un código 201 (creado) y los datos del balance
  } catch (err) {
    console.error("Error en balancePost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de balance no válidos.",
      }); // Responde con un error 400 si los datos no son válidos
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el balance.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para actualizar un balance existente
const balancePut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del balance desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo "_id"

  try {
    const balanceActualizada = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el balance no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!balanceActualizada) {
      return res.status(404).json({ msg: "Balance no encontrado" }); // Responde con un error 404 si no se encuentra el balance
    }

    res.json(balanceActualizada); // Responde con los datos del balance actualizado
  } catch (err) {
    console.error("Error en balancePut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balance no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el balance.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para eliminar (marcar como eliminado) un balance
const balanceDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del balance desde los parámetros de la URL

  try {
    const balance = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el balance no eliminado
      { eliminado: true }, // Marca el balance como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!balance) {
      return res.status(404).json({ msg: "Balance no encontrado" }); // Responde con un error 404 si no se encuentra el balance
    }

    res.json(balance); // Responde con los datos del balance eliminado
  } catch (err) {
    console.error("Error en balanceDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de balance no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el balance.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const balancePatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - balancePatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  balanceGets, // Obtener todas las balances
  balanceGet, // Obtener un balance específico por ID
  balancePost, // Crear un nuevo balance
  balancePut, // Actualizar un balance existente
  balanceDelete, // Eliminar (marcar como eliminado) un balance
  balancePatch, // Manejar solicitudes PATCH
};
