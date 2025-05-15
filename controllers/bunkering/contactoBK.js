// Importaciones necesarias
const { response, request } = require("express");
const ContactoBK = require("../../models/bunkering/contactoBK"); // Modelo ContactoBK para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" }, // Popula el nombre del bunkering
  { path: "compras.contrato", select: "nombre fecha" }, // Popula las compras realizadas
  { path: "ventas.contrato", select: "nombre fecha" }, // Popula las ventas realizadas
  { path: "createdBy", select: "nombre correo" }, // Popula el usuario que creó el contacto
];

// Controlador para obtener todos los contactos
const contactoGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo contactos no eliminados

  try {
    const [total, contactos] = await Promise.all([
      ContactoBK.countDocuments(query), // Cuenta el total de contactos
      ContactoBK.find(query).populate(populateOptions), // Obtiene los contactos con referencias pobladas
    ]);

    res.json({ total, contactos }); // Responde con el total y la lista de contactos
  } catch (err) {
    console.error("Error en contactoGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los contactos.",
    });
  }
};

// Controlador para obtener un contacto específico por ID
const contactoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contacto desde los parámetros de la URL

  try {
    const contacto = await ContactoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions); // Busca el contacto por ID y popula las referencias

    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" }); // Responde con un error 404 si no se encuentra el contacto
    }

    res.json(contacto); // Responde con los datos del contacto
  } catch (err) {
    console.error("Error en contactoGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el contacto.",
    });
  }
};

// Controlador para crear un nuevo contacto
const contactoPost = async (req = request, res = response) => {
  const {
    idBunkering,
    nombre,
    ciudad,
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
    compras,
    ventas,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevoContacto = new ContactoBK({
      idBunkering,
      nombre,
      ciudad,
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
      compras,
      ventas,
      createdBy: req.usuario._id, // ID del usuario que creó el contacto
    });

    await nuevoContacto.save(); // Guarda el nuevo contacto en la base de datos
    await nuevoContacto.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevoContacto); // Responde con un código 201 (creado) y los datos del contacto
  } catch (err) {
    console.error("Error en contactoPost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear el contacto.",
    });
  }
};

// Controlador para actualizar un contacto existente
const contactoPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contacto desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo ciertos campos

  try {
    const antes = await ContactoBK.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const contactoActualizado = await ContactoBK.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el contacto no eliminado
      {
        ...resto,
        $push: {
          historialModificaciones: { modificadoPor: req.usuario._id, cambios },
        },
      }, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!contactoActualizado) {
      return res.status(404).json({ msg: "Contacto no encontrado" }); // Responde con un error 404 si no se encuentra el contacto
    }

    res.json(contactoActualizado); // Responde con los datos del contacto actualizado
  } catch (err) {
    console.error("Error en contactoPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el contacto.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) un contacto
const contactoDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contacto desde los parámetros de la URL

  try {
    const antes = await ContactoBK.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const contactoEliminado = await ContactoBK.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el contacto no eliminado
      {
        eliminado: true,
        $push: {
          historialModificaciones: { modificadoPor: req.usuario._id, cambios },
        },
      },
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!contactoEliminado) {
      return res.status(404).json({ msg: "Contacto no encontrado" }); // Responde con un error 404 si no se encuentra el contacto
    }

    res.json(contactoEliminado); // Responde con los datos del contacto eliminado
  } catch (err) {
    console.error("Error en contactoDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el contacto.",
    });
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  contactoGets, // Obtener todos los contactos
  contactoGet, // Obtener un contacto específico por ID
  contactoPost, // Crear un nuevo contacto
  contactoPut, // Actualizar un contacto existente
  contactoDelete, // Eliminar (marcar como eliminado) un contacto
};
