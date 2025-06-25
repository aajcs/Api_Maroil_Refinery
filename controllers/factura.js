// Importaciones necesarias
const { response, request } = require("express");
const mongoose = require("mongoose");
const Factura = require("../models/factura");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idRefineria", select: "nombre" },
  { path: "idPartida", select: "descripcion codigo" },
  { path: "idSubPartida", select: "descripcion codigo" },
];

// Controlador para obtener todas las facturas
const facturaGets = async (req = request, res = response, next) => {
  const query = { eliminado: false }; // Filtro para obtener solo las facturas no eliminadas

  try {
    const [total, facturas] = await Promise.all([
      Factura.countDocuments(query), // Cuenta el total de facturas
      Factura.find(query).populate(populateOptions), // Aplica las opciones de población
    ]);

    res.json({ total, facturas }); // Responde con el total y la lista de facturas
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para obtener una factura específica por ID
const facturaGet = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const factura = await Factura.findById(id).populate(populateOptions); // Aplica las opciones de población

    if (!factura) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    res.json(factura); // Responde con los datos de la factura
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para crear una nueva factura
const facturaPost = async (req = request, res = response, next) => {
  const {
    idRefineria,
    concepto,
    lineas,
    total,
    aprobada,
    idPartida,
    idSubPartida,
    fechaFactura,
  } = req.body;

  try {
    const nuevaFactura = new Factura({
      idRefineria,
      concepto,
      lineas,
      total,
      aprobada,
      idPartida,
      idSubPartida,
      fechaFactura,
    });

    await nuevaFactura.save(); // Guarda la nueva factura en la base de datos

    // Población de los campos relacionados
    const facturaPopulada = await Factura.findById(nuevaFactura._id).populate(
      populateOptions
    );

    res.status(201).json(facturaPopulada); // Responde con un código 201 (creado) y los datos de la factura populada
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para actualizar una factura existente
const facturaPut = async (req = request, res = response, next) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body; // Excluye el campo _id del cuerpo de la solicitud

  try {
    const facturaActualizada = await Factura.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la factura no eliminada
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!facturaActualizada) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    res.json(facturaActualizada); // Responde con los datos de la factura actualizada
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const facturaPatch = async (req = request, res = response, next) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body; // Excluye el campo _id del cuerpo de la solicitud

  try {
    // Verifica si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        errors: [
          {
            value: id,
            msg: "ID de factura no válido.",
            param: "id",
            location: "params",
          },
        ],
      });
    }

    // Actualiza parcialmente la factura
    const facturaActualizada = await Factura.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la factura no eliminada
      { $set: resto }, // Actualiza solo los campos proporcionados
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!facturaActualizada) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    res.json(facturaActualizada); // Responde con los datos de la factura actualizada
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Controlador para eliminar (marcar como eliminada) una factura
const facturaDelete = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const factura = await Factura.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar la factura no eliminada
      { eliminado: true }, // Marca la factura como eliminada
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Aplica las opciones de población

    if (!factura) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    res.json(factura); // Responde con los datos de la factura eliminada
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  facturaGets, // Obtener todas las facturas
  facturaGet, // Obtener una factura específica por ID
  facturaPost, // Crear una nueva factura
  facturaPut, // Actualizar una factura existente
  facturaPatch, // Actualizar parcialmente una factura
  facturaDelete, // Eliminar (marcar como eliminada) una factura
};
