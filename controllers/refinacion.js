//const Refinacion = require("../models/Refinacion");
//const Tanque = require("../models/Tanque"); // Importa el modelo Tanque si es necesario

// Crear un nuevo proceso de refinación
const crearRefinacion = async (req, res) => {
  try {
    const {
      id_tanque,
      materiaPrima,
      proceso,
      derivados,
      controlCalidad,
      historialOperaciones,
    } = req.body;

    // Verificar si el tanque existe
    const tanqueExistente = await Tanque.findById(id_tanque);
    if (!tanqueExistente) {
      return res.status(404).json({
        error: "El tanque especificado no existe",
      });
    }

    // Crear el nuevo proceso de refinación
    const nuevaRefinacion = new Refinacion({
      id_tanque,
      materiaPrima,
      proceso,
      derivados,
      controlCalidad,
      historialOperaciones,
    });

    // Guardar el proceso de refinación en la base de datos
    await nuevaRefinacion.save();

    // Poblar los campos relacionados (tanque)
    const refinacionPoblada = await Refinacion.findById(nuevaRefinacion._id)
      .populate("id_tanque", "nombre capacidad ubicacion")
      .exec();

    // Respuesta exitosa
    res.status(201).json({
      message: "Proceso de refinación creado exitosamente",
      refinacion: refinacionPoblada,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al crear el proceso de refinación",
      details: error.message,
    });
  }
};

// Obtener todos los procesos de refinación
const obtenerRefinaciones = async (req, res) => {
  try {
    const refinaciones = await Refinacion.find()
      .populate("id_tanque", "nombre capacidad ubicacion")
      .exec();
    res.status(200).json(refinaciones);
  } catch (error) {
    res.status(400).json({
      error: "Error al obtener los procesos de refinación",
      details: error.message,
    });
  }
};

// Obtener un proceso de refinación por su ID
const obtenerRefinacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const refinacion = await Refinacion.findById(id)
      .populate("id_tanque", "nombre capacidad ubicacion")
      .exec();

    if (!refinacion) {
      return res.status(404).json({
        error: "Proceso de refinación no encontrado",
      });
    }

    res.status(200).json(refinacion);
  } catch (error) {
    res.status(400).json({
      error: "Error al obtener el proceso de refinación",
      details: error.message,
    });
  }
};

// Actualizar un proceso de refinación por su ID
const actualizarRefinacion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Buscar y actualizar el proceso de refinación
    const refinacionActualizada = await Refinacion.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("id_tanque", "nombre capacidad ubicacion")
      .exec();

    if (!refinacionActualizada) {
      return res.status(404).json({
        error: "Proceso de refinación no encontrado",
      });
    }

    // Registrar la modificación en el historial
    const modificacion = {
      fecha: new Date(),
      operacion: "Actualización de proceso de refinación",
      usuario: req.usuario?.id || "Sistema", // Asumiendo que tienes un sistema de autenticación
    };
    refinacionActualizada.historialOperaciones.push(modificacion);
    await refinacionActualizada.save();

    res.status(200).json({
      message: "Proceso de refinación actualizado exitosamente",
      refinacion: refinacionActualizada,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar el proceso de refinación",
      details: error.message,
    });
  }
};

// Eliminar un proceso de refinación por su ID
const eliminarRefinacion = async (req, res) => {
  try {
    const { id } = req.params;
    const refinacionEliminada = await Refinacion.findByIdAndDelete(id);

    if (!refinacionEliminada) {
      return res.status(404).json({
        error: "Proceso de refinación no encontrado",
      });
    }

    res.status(200).json({
      message: "Proceso de refinación eliminado exitosamente",
      refinacion: refinacionEliminada,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al eliminar el proceso de refinación",
      details: error.message,
    });
  }
};

module.exports = {
  crearRefinacion,
  obtenerRefinaciones,
  obtenerRefinacionPorId,
  actualizarRefinacion,
  eliminarRefinacion,
};