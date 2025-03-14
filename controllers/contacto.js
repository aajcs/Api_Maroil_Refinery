const { response, request } = require("express");
const Contacto = require("../models/contacto");

// Opciones de populate reutilizables
const populateOptions = [{ path: "idRefineria", select: "nombre" }];

//Obtener todos los contactos
const contactoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contactos] = await Promise.all([
      Contacto.countDocuments(query), // Contar documentos
      Contacto.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (contactos.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron contactos con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, contactos });
  } catch (err) {
    console.error("Error en contactoGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las contactos.",
    });
  }
};

// Obtener una contacto específico por ID
const contactoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contacto = await Contacto.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" });
    }

    res.json(contacto);
  } catch (err) {
    console.error("Error en contactoGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contacto no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la contacto.",
    });
  }
};

// Crear una nuevo contacto
const contactoPost = async (req = request, res = response) => {
  const {
    nombre,
    ubicacion,
    identificacionFiscal,
    representanteLegal,
    telefono,
    correo,
    email,
    direccion,
    tipo,
    cuentasBancarias,
    cuentasPorPagar,
    cuentasPorCobrar,
  } = req.body;

  try {
    const nuevaContacto = new Contacto({
      nombre,
      ubicacion,
      identificacionFiscal,
      representanteLegal,
      telefono,
      correo,
      email,
      direccion,
      tipo,
      cuentasBancarias,
      cuentasPorPagar,
      cuentasPorCobrar,
    });

    await nuevaContacto.save();

    // Poblar referencias después de guardar
    await nuevaContacto.populate(populateOptions);

    res.status(201).json(nuevaContacto);
  } catch (err) {
    console.error("Error en contactoPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de contacto no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la contacto.",
    });
  }
};

// Actualizar una contacto existente
const contactoPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, idChequeoCalidad, idChequeoCantidad, ...resto } = req.body;
  try {
    const contactoActualizada = await Contacto.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!contactoActualizada) {
      return res.status(404).json({ msg: "Contacto no encontrado" });
    }

    res.json(contactoActualizada);
  } catch (err) {
    console.error("Error en contactoPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contacto no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la contacto.",
    });
  }
};

// Eliminar (marcar como eliminado) una contacto
const contactoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contacto = await Contacto.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" });
    }

    res.json(contacto);
  } catch (err) {
    console.error("Error en contactoDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contacto no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la contacto.",
    });
  }
};

// Parchear una contacto (ejemplo básico)
const contactoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - contactoPatch",
  });
};

module.exports = {
  contactoGets,
  contactoGet,
  contactoPost,
  contactoPut,
  contactoDelete,
  contactoPatch,
};
