const { response, request } = require("express");
const Inventario = require("../models/inventario");

// Opciones de población reutilizables
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Popula el nombre de la refinería
  { path: "idContrato", select: "numeroContrato descripcion" }, // Popula campos seleccionados del contrato
  { path: "cantidadRecibida.idRecepcion", select: "fechaRecepcion cantidad" }, // Popula detalles de recepciones
  { path: "cantidadRefinar.idRefinacion", select: "fecha cantidad" }, // Popula detalles de refinaciones
  { path: "cantidadRefinada.idrefinacionSalida", select: "fecha cantidad" }, // Popula detalles de refinación salida
  { path: "idTanque", select: "nombre capacidad" }, // Popula detalles del tanque
];

// Obtener todos los inventarios
const inventarioGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Solo inventarios no eliminados

  try {
    const [total, inventarios] = await Promise.all([
      Inventario.countDocuments(query), // Total de inventarios no eliminados
      Inventario.find(query).populate(populateOptions), // Obtiene inventarios poblados
    ]);

    res.json({
      total,
      inventarios,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un inventario por ID
const inventarioGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const inventario = await Inventario.findById(id).populate(populateOptions);

    if (!inventario || inventario.eliminado) {
      return res.status(404).json({ msg: "Inventario no encontrado" });
    }

    res.json(inventario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo inventario
const inventarioPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idContrato,
    cantidadRecibida,
    cantidadRefinar,
    cantidadRefinada,
    costoPromedio,
    idTanque,
  } = req.body;

  try {
    const nuevoInventario = new Inventario({
      idRefineria,
      idContrato,
      cantidadRecibida,
      cantidadRefinar,
      cantidadRefinada,
      costoPromedio,
      idTanque,
    });

    await nuevoInventario.save();
    await nuevoInventario.populate(populateOptions);

    res.status(201).json(nuevoInventario);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un inventario existente
const inventarioPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { eliminado, ...data } = req.body; // No se permite modificar el campo "eliminado"

  try {
    const inventarioActualizado = await Inventario.findByIdAndUpdate(
      id,
      data,
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions);

    if (!inventarioActualizado || inventarioActualizado.eliminado) {
      return res.status(404).json({ msg: "Inventario no encontrado" });
    }

    res.json(inventarioActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (eliminación lógica) un inventario
const inventarioDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const inventarioEliminado = await Inventario.findByIdAndUpdate(
      id,
      { eliminado: true }, // Marca como eliminado
      { new: true } // Devuelve el documento actualizado
    );

    if (!inventarioEliminado) {
      return res.status(404).json({ msg: "Inventario no encontrado" });
    }

    res.json({
      msg: "Inventario eliminado correctamente",
      inventarioEliminado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const inventarioPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - inventarioPatch", // Mensaje de prueba
  });
};

// Exportar los controladores
module.exports = {
  inventarioGets, // Obtener todos los inventarios
  inventarioGet, // Obtener un inventario por ID
  inventarioPost, // Crear un nuevo inventario
  inventarioPut, // Actualizar un inventario existente
  inventarioDelete, // Eliminar (lógico) un inventario
  inventarioPatch, // Manejar solicitudes PATCH
};
