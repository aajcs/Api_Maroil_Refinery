const { response, request } = require("express");
const ContactoBunker = require("../../models/bunker/contactoBunker");

// Opciones de populate reutilizables
const populateOptions = [{ path: "idBuker", select: "nombre" }];

//Obtener todos los contactoBunkers
const contactoBunkerGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contactoBunkers] = await Promise.all([
      ContactoBunker.countDocuments(query), // Contar documentos
      ContactoBunker.find(query).populate(populateOptions), // Poblar referencias y convertir a JSON
    ]);

    // Validar si hay datos
    if (contactoBunkers.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron contactoBunkers con los criterios proporcionados.",
      });
    }

    // Respuesta exitosa
    res.json({ total, contactoBunkers });
  } catch (err) {
    console.error("Error en contactoBunkerGets:", err);

    // Manejo de errores específicos
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      });
    }

    // Error genérico
    res.status(500).json({
      error: "Error interno del servidor al obtener las contactoBunkers.",
    });
  }
};

// Obtener una contactoBunker específico por ID
const contactoBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contactoBunker = await ContactoBunker.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!contactoBunker) {
      return res.status(404).json({ msg: "ContactoBunker no encontrado" });
    }

    res.json(contactoBunker);
  } catch (err) {
    console.error("Error en contactoBunkerGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contactoBunker no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener la contactoBunker.",
    });
  }
};

// Crear una nuevo contactoBunker
const contactoBunkerPost = async (req = request, res = response) => {
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
    const nuevaContactoBunker = new ContactoBunker({
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

    await nuevaContactoBunker.save();

    // Poblar referencias después de guardar
    await nuevaContactoBunker.populate(populateOptions);

    res.status(201).json(nuevaContactoBunker);
  } catch (err) {
    console.error("Error en contactoBunkerPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de contactoBunker no válidos.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear la contactoBunker.",
    });
  }
};

// Actualizar una contactoBunker existente
const contactoBunkerPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, idChequeoCalidad, idChequeoCantidad, ...resto } = req.body;
  try {
    const contactoBunkerActualizada = await ContactoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!contactoBunkerActualizada) {
      return res.status(404).json({ msg: "ContactoBunker no encontrado" });
    }

    res.json(contactoBunkerActualizada);
  } catch (err) {
    console.error("Error en contactoBunkerPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contactoBunker no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar la contactoBunker.",
    });
  }
};

// Eliminar (marcar como eliminado) una contactoBunker
const contactoBunkerDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contactoBunker = await ContactoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions); // Poblar referencias // Convertir a JSON
    if (!contactoBunker) {
      return res.status(404).json({ msg: "ContactoBunker no encontrado" });
    }

    res.json(contactoBunker);
  } catch (err) {
    console.error("Error en contactoBunkerDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contactoBunker no válido.",
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar la contactoBunker.",
    });
  }
};

// Parchear una contactoBunker (ejemplo básico)
const contactoBunkerPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - contactoBunkerPatch",
  });
};

module.exports = {
  contactoBunkerGets,
  contactoBunkerGet,
  contactoBunkerPost,
  contactoBunkerPut,
  contactoBunkerDelete,
  contactoBunkerPatch,
};
