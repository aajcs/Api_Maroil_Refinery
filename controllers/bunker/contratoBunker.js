const { response, request } = require("express");
const ContratoBunker = require("../../models/bunker/contratoBunker");
// const contratoBunkerItems = require("../../models/bunker/contratoBunkerItems");

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

// Obtener todos los contratoBunkers con paginación y población de referencias
const contratoBunkerGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contratoBunkers] = await Promise.all([
      ContratoBunker.countDocuments(query),
      ContratoBunker.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      contratoBunkers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un contratoBunker específico por ID
const contratoBunkerGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contratoBunker = await ContratoBunker.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!contratoBunker) {
      return res.status(404).json({ msg: "ContratoBunker no encontrado" });
    }

    res.json(contratoBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo contratoBunker FUNCIONAL
const contratoBunkerPost = async (req, res = response) => {
  const {
    numeroContratoBunker,
    descripcion,
    tipoContratoBunker,
    estadoContratoBunker,
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
    // 1. Crear el contratoBunker
    const nuevoContratoBunker = new ContratoBunker({
      numeroContratoBunker,
      descripcion,
      tipoContratoBunker,
      estadoContratoBunker,
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

    // 2. Guardar el contratoBunker para obtener el ID
    await nuevoContratoBunker.save();

    // 3. Crear y guardar los items asociados al contratoBunker
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new contratoBunkerItems({
          ...item, // Spread operator para copiar las propiedades del item
          idContratoBunker: nuevoContratoBunker.id, // Asignar el ID del contratoBunker al item
        });
        return await nuevoItem.save();
      })
    );

    // 4. Actualizar el contratoBunker con los IDs de los items
    nuevoContratoBunker.idItems = nuevosItems.map((item) => item.id);
    await nuevoContratoBunker.save();

    // 5. Populate para obtener los datos de refinería y contacto
    await nuevoContratoBunker.populate(populateOptions),
      res.status(201).json(nuevoContratoBunker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contratoBunker existente
const contratoBunkerPut = async (req, res = response) => {
  const { id } = req.params;
  const { items, idItems, ...resto } = req.body;
  console.log("tengo items?", resto, id);

  try {
    // 1. Actualizar el contratoBunker
    const contratoBunkerActualizado = await ContratoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    );
    console.log("llego aqui?", contratoBunkerActualizado);

    if (!contratoBunkerActualizado) {
      return res.status(404).json({ msg: "ContratoBunker no encontrado" });
    }
    // 2. Actualizar o crear los items asociados al contratoBunker
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        if (item.id) {
          console.log("lo actuailizo");
          // Si el item tiene un _id, actualizarlo
          return await contratoBunkerItems.findByIdAndUpdate(item.id, item, {
            new: true,
          });
        } else {
          // Si el item no tiene un _id, crearlo
          const nuevoItem = new contratoBunkerItems({
            ...item, // Spread operator para copiar las propiedades del item
            idContratoBunker: id, // Asignar el ID del contratoBunker al item
          });
          return await nuevoItem.save();
        }
      })
    );
    // console.log(nuevosItems);
    // 3. Actualizar el contratoBunker con los IDs de los items
    contratoBunkerActualizado.idItems = nuevosItems.map((item) => item.id);
    await contratoBunkerActualizado.save();

    // 4. Populate para obtener los datos de refinería y contacto
    await contratoBunkerActualizado.populate(populateOptions),
      res.json(contratoBunkerActualizado);
  } catch (err) {
    // console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contratoBunker
const contratoBunkerDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const contratoBunker = await ContratoBunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);
    if (!contratoBunker) {
      return res.status(404).json({ msg: "ContratoBunker no encontrado" });
    }

    res.json(contratoBunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un contratoBunker (ejemplo básico)
const contratoBunkerPatch = (req, res = response) => {
  res.json({
    msg: "patch API - contratoBunkersPatch",
  });
};

module.exports = {
  contratoBunkerPost,
  contratoBunkerGet,
  contratoBunkerGets,
  contratoBunkerPut,
  contratoBunkerDelete,
  contratoBunkerPatch,
};
