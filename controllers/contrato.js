// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Contrato = require("../models/contrato"); // Modelo Contrato para interactuar con la base de datos
const contratoItems = require("../models/contratoItems"); // Modelo contratoItems para manejar los ítems asociados a un contrato

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idRefineria", // Relación con el modelo Refineria
    select: "nombre", // Selecciona el campo "nombre"
  },
  {
    path: "idContacto", // Relación con el modelo Contacto
    select: "nombre", // Selecciona el campo "nombre"
  },
  {
    path: "idItems", // Relación con los ítems del contrato
    populate: [
      { path: "producto", select: "nombre" }, // Relación con el modelo Producto
      { path: "idTipoProducto", select: "nombre" }, // Relación con el modelo TipoProducto
    ],
  },
];

// Controlador para obtener todos los contratos con población de referencias
const contratoGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo contratos no eliminados

  try {
    const [total, contratos] = await Promise.all([
      Contrato.countDocuments(query), // Cuenta el total de contratos
      Contrato.find(query).populate(populateOptions), // Obtiene los contratos con referencias pobladas
    ]);

    res.json({
      total,
      contratos,
    });
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para obtener un contrato específico por ID
const contratoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contrato desde los parámetros de la URL

  try {
    const contrato = await Contrato.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions); // Busca el contrato por ID y popula las referencias

    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" }); // Responde con un error 404 si no se encuentra el contrato
    }

    res.json(contrato); // Responde con los datos del contrato
  } catch (err) {
    console.error(err); // Muestra el error en la consola
    res.status(500).json({ error: err.message }); // Responde con un error 500 y el mensaje del error
  }
};

// Controlador para crear un nuevo contrato
const contratoPost = async (req, res = response) => {
  const {
    idRefineria,
    idContacto,
    abono,
    clausulas,
    condicionesPago,
    descripcion,
    destino,
    estadoContrato,
    estadoEntrega,
    fechaEnvio,
    fechaFin,
    fechaInicio,
    items, // Array de objetos item
    montoTotal,
    numeroContrato,
    plazo,
    tipoContrato,
    observacion,
  } = req.body;

  let nuevoContrato; // Declarar fuera del bloque try

  try {
    // 1. Crear el contrato
    nuevoContrato = new Contrato({
      idRefineria,
      idContacto,
      abono,
      clausulas,
      condicionesPago,
      descripcion,
      destino,
      estadoContrato,
      estadoEntrega,
      fechaEnvio,
      fechaFin,
      fechaInicio,
      items,
      montoTotal,
      numeroContrato,
      plazo,
      tipoContrato,
      observacion,
    });

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "El contrato debe incluir al menos un item en el campo 'items'.",
      });
    }

    // 2. Guardar el contrato para obtener el ID
    await nuevoContrato.save();

    // 3. Crear y guardar los ítems asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new contratoItems({
          ...item, // Copiar las propiedades del item
          idContrato: nuevoContrato.id, // Asignar el ID del contrato al ítem
        });
        return await nuevoItem.save();
      })
    );

    // 4. Actualizar el contrato con los IDs de los ítems
    nuevoContrato.idItems = nuevosItems.map((item) => item.id);
    await nuevoContrato.save();

    // 5. Poblar referencias y responder con el contrato creado
    await nuevoContrato.populate(populateOptions);
    res.status(201).json(nuevoContrato);
  } catch (err) {
    console.error(err);

    // Si ocurre un error, eliminar el contrato creado
    if (nuevoContrato && nuevoContrato.id) {
      await Contrato.findByIdAndDelete(nuevoContrato.id);
    }
    res.status(400).json({ error: err.message });
  }
};

// Controlador para actualizar un contrato existente
const contratoPut = async (req, res = response) => {
  const { id } = req.params;
  const { items, idItems, ...resto } = req.body;

  try {
    // Validar que el contrato exista antes de intentar actualizarlo
    const contratoExistente = await Contrato.findOne({
      _id: id,
      eliminado: false,
    });
    if (!contratoExistente) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    // Validar que el campo 'items' sea un array válido
    if (!items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ error: "El campo 'items' debe ser un array válido." });
    }

    // 1. Actualizar el contrato
    const contratoActualizado = await Contrato.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    );

    // 2. Actualizar o crear los ítems asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        if (item.id) {
          // Si el ítem tiene un ID, actualizarlo
          return await contratoItems.findByIdAndUpdate(item.id, item, {
            new: true,
          });
        } else {
          // Si el ítem no tiene un ID, crearlo
          const nuevoItem = new contratoItems({
            ...item,
            idContrato: id,
          });
          return await nuevoItem.save();
        }
      })
    );

    // 3. Actualizar el contrato con los IDs de los ítems
    contratoActualizado.idItems = nuevosItems.map((item) => item.id);
    await contratoActualizado.save();

    // 4. Poblar referencias y responder con el contrato actualizado
    await contratoActualizado.populate(populateOptions);
    res.json(contratoActualizado);
  } catch (err) {
    console.error("Error en contratoPut:", err);
    res.status(400).json({ error: err.message });
  }
};

// Controlador para eliminar (marcar como eliminado) un contrato
const contratoDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const contrato = await Contrato.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    res.json(contrato);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const contratoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - contratosPatch",
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  contratoPost, // Crear un nuevo contrato
  contratoGet, // Obtener un contrato específico por ID
  contratoGets, // Obtener todos los contratos
  contratoPut, // Actualizar un contrato existente
  contratoDelete, // Eliminar (marcar como eliminado) un contrato
  contratoPatch, // Manejar solicitudes PATCH
};
