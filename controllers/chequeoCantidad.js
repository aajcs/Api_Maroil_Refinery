// Importaciones necesarias
const { response, request } = require("express");
const ChequeoCantidad = require("../models/chequeoCantidad");
const Recepcion = require("../models/recepcion");
const Despacho = require("../models/despacho");
const Tanque = require("../models/tanque");

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
// Función auxiliar para actualizar el modelo relacionado
const actualizarModeloRelacionado = async (idReferencia, tipo, datos) => {
  try {
    console.log(`Actualizando modelo relacionado: ${tipo}`);
    console.log(`ID de referencia: ${idReferencia}`);
    console.log(`Datos enviados:`, datos);

    let resultado;

    if (tipo === "Recepcion") {
      resultado = await Recepcion.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true } // Asegúrate de incluir esta opción
      );
    } else if (tipo === "Despacho") {
      resultado = await Despacho.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    } else if (tipo === "Tanque") {
      resultado = await Tanque.findByIdAndUpdate(
        idReferencia,
        { $set: datos },
        { new: true }
      );
    }

    console.log("Resultado de la actualización:", resultado);

    if (!resultado) {
      throw new Error(
        `No se encontró el modelo ${tipo} con ID: ${idReferencia}`
      );
    }
  } catch (err) {
    console.error(`Error al actualizar el modelo ${tipo}:`, err);
    throw new Error(`Error al actualizar el modelo ${tipo}`);
  }
};

// Controlador para obtener todos los chequeos de cantidad
const chequeoCantidadGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo chequeos activos y no eliminados

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
    estado,
  } = req.body;

  try {
    const nuevoChequeo = new ChequeoCantidad({
      idRefineria,
      aplicar,
      idProducto,
      idOperador,
      fechaChequeo,
      cantidad,
      estado,
    });

    await nuevoChequeo.save(); // Guarda el nuevo chequeo en la base de datos
    await nuevoChequeo.populate(populateOptions); // Poblar referencias después de guardar

     // Actualizar el modelo relacionado
     if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        idChequeoCantidad: nuevoChequeo._id, // Cambiado a idChequeoCantidad
      });
    }

    res.status(201).json(nuevoChequeo); // Responde con un código 201 (creado) y los datos del chequeo
  } catch (err) {
    console.error("Error en chequeoCantidadPost:", err); // Muestra el error completo en la consola
    res.status(400).json({
      error:
        err.message ||
        "Error interno del servidor al crear el chequeo de cantidad.",
    });
  }
};

// Controlador para actualizar un chequeo de cantidad existente
const chequeoCantidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, aplicar, ...resto } = req.body;

  try {

    // Validar que idReferencia sea un ObjectId válido
       if (
         aplicar &&
         aplicar.idReferencia &&
         !mongoose.Types.ObjectId.isValid(aplicar.idReferencia)
       ) {
         return res.status(400).json({
           error: "El ID de referencia no es válido.",
         });
       }
   
       const chequeoActualizado = await ChequeoCantidad.findOneAndUpdate(
         { _id: id, eliminado: false },
         { ...resto, aplicar }, // Actualiza el chequeo y la referencia
         { new: true }
       ).populate(populateOptions);
   
       if (!chequeoActualizado) {
         return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
       }
    
    // Actualizar el modelo relacionado
    if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        chequeoCantidad: chequeoActualizado._id,
      });
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
     // Actualizar el modelo relacionado
     if (
      chequeo.aplicar &&
      chequeo.aplicar.idReferencia &&
      chequeo.aplicar.tipo
    ) {
      await actualizarModeloRelacionado(
        chequeo.aplicar.idReferencia,
        chequeo.aplicar.tipo,
        {
          chequeoCantidad: null, // Eliminar la referencia al chequeo
        }
      );
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
     // Actualizar el modelo relacionado
     if (aplicar && aplicar.idReferencia && aplicar.tipo) {
      await actualizarModeloRelacionado(aplicar.idReferencia, aplicar.tipo, {
        chequeoCantidad: chequeoActualizado._id,
      });
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
