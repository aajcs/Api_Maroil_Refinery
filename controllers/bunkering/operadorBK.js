const { response, request } = require("express");
const Operador = require("../models/operador");

// Opciones de población reutilizables para consultas
const populateOptions = [{ path: "idRefineria", select: "nombre" }];

// Controlador para obtener todos los operadores
const operadorGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para operadores no eliminados

  try {
    const [total, operadors] = await Promise.all([
      Operador.countDocuments(query), // Cuenta el total de operadores
      Operador.find(query).populate(populateOptions), // Obtiene los operadores con referencias pobladas
    ]);

    res.json({ total, operadors }); // Responde con el total y la lista de operadores
  } catch (err) {
    console.error("Error en operadorGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los operadores.",
    });
  }
};

// Controlador para obtener un operador específico por ID
const operadorGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const operador = await Operador.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!operador) {
      return res.status(404).json({ msg: "Operador no encontrado" });
    }

    res.json(operador);
  } catch (err) {
    console.error("Error en operadorGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el operador.",
    });
  }
};

// Controlador para crear un nuevo operador
const operadorPost = async (req = request, res = response) => {
  const { nombre, cargo, turno, idRefineria } = req.body;

  try {
    const nuevoOperador = new Operador({
      nombre,
      cargo,
      turno,
      idRefineria,
    });

    await nuevoOperador.save();
    await nuevoOperador.populate(populateOptions);

    res.status(201).json(nuevoOperador);
  } catch (err) {
    console.error("Error en operadorPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear el operador.",
    });
  }
};

// Controlador para actualizar un operador existente
const operadorPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const operadorActualizado = await Operador.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!operadorActualizado) {
      return res.status(404).json({ msg: "Operador no encontrado" });
    }

    res.json(operadorActualizado);
  } catch (err) {
    console.error("Error en operadorPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el operador.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un operador
const operadorDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const operador = await Operador.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!operador) {
      return res.status(404).json({ msg: "Operador no encontrado" });
    }

    res.json(operador);
  } catch (err) {
    console.error("Error en operadorDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el operador.",
    });
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const operadorPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - operadorPatch",
  });
};

module.exports = {
  operadorGets, // Obtener todos los operadores
  operadorGet, // Obtener un operador específico por ID
  operadorPost, // Crear un nuevo operador
  operadorPut, // Actualizar un operador existente
  operadorDelete, // Eliminar (marcar como eliminado) un operador
  operadorPatch, // Manejar solicitudes PATCH
};
