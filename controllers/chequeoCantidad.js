// Importaciones necesarias
const { response, request } = require("express");
const ChequeoCantidad = require("../models/chequeoCantidad");
const Refinacion = require("../models/refinacion"); // Modelo Refinacion para manejar relaciones

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria
  {
    path: "aplicar.idReferencia",
    select: {
      // Selección condicional basada en el tipo
      nombre: 1, // Campo para el modelo Tanque
      idGuia: 1, // Campo para el modelo Recepcion
      idGuia: 1, // Campo para el modelo Despacho
    },
  },
  { path: "idProducto", select: "nombre" }, // Relación con el modelo Producto
  { path: "idOperador", select: "nombre" }, // Relación con el modelo Operador
];

// Controlador para obtener todos los chequeos de cantidad
const chequeoCantidadGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false }; // Filtro para obtener solo chequeos activos y no eliminados

  try {
    const [total, chequeoCantidads] = await Promise.all([
      ChequeoCantidad.countDocuments(query), // Cuenta el total de chequeos
      ChequeoCantidad.find(query).populate(populateOptions), // Obtiene los chequeos con referencias pobladas
    ]);

    if (chequeoCantidads.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron chequeos de cantidad con los criterios proporcionados.",
      });
    }

    res.json({ total, chequeoCantidads }); // Responde con el total y la lista de chequeos
  } catch (err) {
    console.error("Error en chequeoCantidadGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los chequeos de cantidad.",
    });
  }
};

// Controlador para obtener un chequeo de cantidad específico por ID
const chequeoCantidadGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeo = await ChequeoCantidad.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeo);
  } catch (err) {
    console.error("Error en chequeoCantidadGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el chequeo de cantidad.",
    });
  }
};

// Controlador para crear un nuevo chequeo de cantidad
const chequeoCantidadPost = async (req = request, res = response) => {
  const {
    idRefineria,
    aplicar,
    idProducto,
    idOperador,
    fechaChequeo,
    cantidad,
  } = req.body;

  try {
    const nuevoChequeo = new ChequeoCantidad({
      idRefineria,
      aplicar,
      idProducto,
      idOperador,
      fechaChequeo,
      cantidad,
    });

    await nuevoChequeo.save(); // Guarda el nuevo chequeo en la base de datos
    await nuevoChequeo.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevoChequeo); // Responde con un código 201 (creado) y los datos del chequeo
  } catch (err) {
    console.error("Error en chequeoCantidadPost:", err);
    res.status(400).json({
      error: "Error interno del servidor al crear el chequeo de cantidad.",
    });
  }
};

// Controlador para actualizar un chequeo de cantidad existente
const chequeoCantidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el chequeo no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoActualizado); // Responde con los datos del chequeo actualizado
  } catch (err) {
    console.error("Error en chequeoCantidadPut:", err);
    res.status(400).json({
      error: "Error interno del servidor al actualizar el chequeo de cantidad.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un chequeo de cantidad
const chequeoCantidadDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeo = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el chequeo no eliminado
      { eliminado: true }, // Marca el chequeo como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions);

    if (!chequeo) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeo); // Responde con los datos del chequeo eliminado
  } catch (err) {
    console.error("Error en chequeoCantidadDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el chequeo de cantidad.",
    });
  }
};

// Controlador para manejar solicitudes PATCH
const chequeoCantidadPatch = async (req = request, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const chequeoActualizado = await ChequeoCantidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!chequeoActualizado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoActualizado);
  } catch (err) {
    console.error("Error en chequeoCantidadPatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente el chequeo de cantidad.",
    });
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  chequeoCantidadGets, // Obtener todos los chequeos de cantidad
  chequeoCantidadGet, // Obtener un chequeo de cantidad específico por ID
  chequeoCantidadPost, // Crear un nuevo chequeo de cantidad
  chequeoCantidadPut, // Actualizar un chequeo de cantidad existente
  chequeoCantidadDelete, // Eliminar (marcar como eliminado) un chequeo de cantidad
  chequeoCantidadPatch, // Manejar solicitudes PATCH
};
