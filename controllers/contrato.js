const { response, request } = require("express");
const Contrato = require("../models/contrato");
const contratoItems = require("../models/contratoItems");

const populateOptions = [
  {
    path: "idRefineria",
    select: "nombre",
  },
  {
    path: "idContacto",
    select: "nombre",
  },
  {
    path: "idItems",
    populate: [
      { path: "producto", select: "nombre" },
      {
        path: "idTipoProducto",
        select: "nombre",
      },
    ],
  },
];

// Obtener todos los contratos con paginación y población de referencias
const contratoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contratos] = await Promise.all([
      Contrato.countDocuments(query),
      Contrato.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      contratos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un contrato específico por ID
const contratoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contrato = await Contrato.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    res.json(contrato);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo contrato FUNCIONAL
const contratoPost = async (req, res = response) => {
  const {
    numeroContrato,
    descripcion,
    tipoContrato,
    estadoContrato,
    idRefineria,
    fechaInicio,
    fechaFin,
    condicionesPago,
    plazo,
    destino,
    fechaEnvio,
    estadoEntrega,
    clausulas,
    idContacto,
    abono,
    items, // Array de objetos item

    montoTotal,
  } = req.body;
  let nuevoContrato; // Declarar fuera del bloque try
  try {
    // 1. Crear el contrato
    nuevoContrato = new Contrato({
      numeroContrato,
      descripcion,
      tipoContrato,
      estadoContrato,
      idRefineria,
      fechaInicio,
      fechaFin,
      condicionesPago,
      plazo,
      destino,
      fechaEnvio,
      estadoEntrega,
      clausulas,
      idContacto,
      abono,

      montoTotal,
    });
    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "El contrato debe incluir al menos un item en el campo 'items'.",
      });
    }
    // 2. Guardar el contrato para obtener el ID
    await nuevoContrato.save();

    // 3. Crear y guardar los items asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new contratoItems({
          ...item, // Spread operator para copiar las propiedades del item
          idContrato: nuevoContrato.id, // Asignar el ID del contrato al item
        });
        return await nuevoItem.save();
      })
    );

    // 4. Actualizar el contrato con los IDs de los items
    nuevoContrato.idItems = nuevosItems.map((item) => item.id);
    await nuevoContrato.save();

    // 5. Populate para obtener los datos de refinería y contacto
    await nuevoContrato.populate(populateOptions),
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

// Actualizar un contrato existente
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

    // Validar que el campo 'items' esté presente y sea un array
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

    if (!contratoActualizado) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    // 2. Actualizar o crear los items asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        try {
          if (item.id) {
            // Si el item tiene un _id, actualizarlo
            return await contratoItems.findByIdAndUpdate(item.id, item, {
              new: true,
            });
          } else {
            // Si el item no tiene un _id, crearlo
            const nuevoItem = new contratoItems({
              ...item, // Spread operator para copiar las propiedades del item
              idContrato: id, // Asignar el ID del contrato al item
            });
            return await nuevoItem.save();
          }
        } catch (error) {
          console.error(
            `Error al procesar el item: ${item.id || "nuevo"}`,
            error
          );
          throw new Error(`Error al procesar el item: ${item.id || "nuevo"}`);
        }
      })
    );

    // 3. Actualizar el contrato con los IDs de los items
    contratoActualizado.idItems = nuevosItems.map((item) => item.id);
    await contratoActualizado.save();

    // 4. Populate para obtener los datos de refinería y contacto
    await contratoActualizado.populate(populateOptions);

    res.json(contratoActualizado);
  } catch (err) {
    console.error("Error en contratoPut:", err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contrato
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

// Parchear un contrato (ejemplo básico)
const contratoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - contratosPatch",
  });
};

module.exports = {
  contratoPost,
  contratoGet,
  contratoGets,
  contratoPut,
  contratoDelete,
  contratoPatch,
};
