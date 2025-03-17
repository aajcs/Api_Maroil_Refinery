const { response, request } = require("express");
const Contrato = require("../models/contrato");
const contratoItems = require("../models/contratoItems");

const populateOptions = [
  {
    path: "idBunker",
    select: "nombre",
  },
  {
    path: "idContacto",
    select: "nombre",
  },
  {
    path: "idItems",
    populate: [{ path: "producto", select: "nombre" }],
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
    idBunker,
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

  try {
    // 1. Crear el contrato
    const nuevoContrato = new Contrato({
      numeroContrato,
      descripcion,
      tipoContrato,
      estadoContrato,
      idBunker,
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
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contrato existente
const contratoPut = async (req, res = response) => {
  const { id } = req.params;
  const { items, idItems, ...resto } = req.body;
  console.log("tengo items?", resto, id);

  try {
    // 1. Actualizar el contrato
    const contratoActualizado = await Contrato.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    );
    console.log("llego aqui?", contratoActualizado);

    if (!contratoActualizado) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }
    // 2. Actualizar o crear los items asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        if (item.id) {
          console.log("lo actuailizo");
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
      })
    );
    // console.log(nuevosItems);
    // 3. Actualizar el contrato con los IDs de los items
    contratoActualizado.idItems = nuevosItems.map((item) => item.id);
    await contratoActualizado.save();

    // 4. Populate para obtener los datos de refinería y contacto
    await contratoActualizado.populate(populateOptions),
      res.json(contratoActualizado);
  } catch (err) {
    // console.error(err);
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
