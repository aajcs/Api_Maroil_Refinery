// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Gasto = require("../models/gasto"); // Modelo Gasto para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria, seleccionando solo el campo "nombre"
];

// Controlador para obtener todos los gastoes con población de referencias
const gastoGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo gastoes activos y no eliminados

  try {
    const [total, gastos] = await Promise.all([
      Gasto.countDocuments(query), // Cuenta el total de gastoes
      Gasto.find(query).populate(populateOptions), // Obtiene los gastoes con referencias pobladas
    ]);

    // if (gastos.length === 0) {
    //   return res.status(404).json({
    //     message: "No se encontraron gastos con los criterios proporcionados.",
    //   }); // Responde con un error 404 si no se encuentran gastoes
    // }

    res.json({ total, gastos }); // Responde con el total y la lista de gastoes
  } catch (err) {
    console.error("Error en gastoGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      }); // Responde con un error 400 si hay un problema con las referencias
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener los gastoes.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un gasto específico por ID
const gastoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID de la recepción desde los parámetros de la URL

  try {
    const gastoActualizada = await Gasto.findById(id).populate(populateOptions); // Busca la recepción por ID y la popula
    if (gastoActualizada) {
      res.json(gastoActualizada); // Responde con los datos de la recepción
    } else {
      res.status(404).json({
        msg: "Gasto no encontrado", // Responde con un error 404 si no se encuentra la recepción
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};
// Controlador para crear un nuevo gasto
const gastoPost = async (req = request, res = response) => {
  const { idRefineria, concepto, cantidad, monto, total, fecha } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevaGasto = new Gasto({
      idRefineria,
      concepto,
      cantidad,
      monto,
      total,
      fecha,
    });

    await nuevaGasto.save(); // Guarda el nuevo gasto en la base de datos

    await nuevaGasto.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaGasto); // Responde con un código 201 (creado) y los datos del gasto
  } catch (err) {
    console.error("Error en gastoPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de gasto no válidos.",
      }); // Responde con un error 400 si los datos no son válidos
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el gasto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para actualizar un gasto existente
const gastoPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del gasto desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo _id

  try {
    const gastoActualizada = await Gasto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el gasto no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!gastoActualizada) {
      return res.status(404).json({ msg: "Gasto no encontrado" }); // Responde con un error 404 si no se encuentra el gasto
    }

    res.json(gastoActualizada); // Responde con los datos del gasto actualizado
  } catch (err) {
    console.error("Error en gastoPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de gasto no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el gasto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para eliminar (marcar como eliminado) un gasto
const gastoDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del gasto desde los parámetros de la URL

  try {
    const gasto = await Gasto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el gasto no eliminado
      { eliminado: true }, // Marca el gasto como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!gasto) {
      return res.status(404).json({ msg: "Gasto no encontrado" }); // Responde con un error 404 si no se encuentra el gasto
    }

    res.json(gasto); // Responde con los datos del gasto eliminado
  } catch (err) {
    console.error("Error en gastoDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de gasto no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el gasto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const gastoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - gastoPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  gastoGets, // Obtener todos los gastoes
  gastoGet, // Obtener un gasto específico por ID
  gastoPost, // Crear un nuevo gasto
  gastoPut, // Actualizar un gasto existente
  gastoDelete, // Eliminar (marcar como eliminado) un gasto
  gastoPatch, // Manejar solicitudes PATCH
};
