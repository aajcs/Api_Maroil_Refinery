const { response, request } = require("express");
const ContratoBK = require("../../models/bunkering/contratoBK");
const ContratoItemsBK = require("../../models/bunkering/contratoItemsBK");
const Cuenta = require("../../models/bunkering/cuentaBK"); // Importar el modelo Cuenta

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idBunkering", select: "nombre" },
  { path: "idContacto", select: "nombre" },
  {
    path: "idItems",
    populate: [
      { path: "producto", select: "nombre" },
      { path: "idTipoProducto", select: "nombre" },
    ],
  },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historialModificaciones",
    populate: { path: "usuario", select: "nombre correo" },
  },
];

// Obtener todos los contratos
const contratoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contratos] = await Promise.all([
      ContratoBK.countDocuments(query),
      ContratoBK.find(query).populate(populateOptions),
    ]);

    res.json({ total, contratos });
  } catch (err) {
    console.error("Error en contratoGets:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Obtener un contrato específico por ID
const contratoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contrato = await ContratoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    res.json(contrato);
  } catch (err) {
    console.error("Error en contratoGet:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Crear un nuevo contrato
const contratoPost = async (req = request, res = response) => {
  const {
    numeroContrato,
    descripcion,
    tipoContrato,
    estadoContrato,
    idBunkering,
    idContacto,
    fechaInicio,
    fechaFin,
    brent,
    condicionesPago,
    montoTotal,
    abono,
    destino,
    fechaEnvio,
    estadoEntrega,
    clausulas,
    observacion,
    items,
  } = req.body;

  let nuevoContrato;

  try {
    // Crear el contrato
    nuevoContrato = new ContratoBK({
      numeroContrato,
      descripcion,
      tipoContrato,
      estadoContrato,
      idBunkering,
      idContacto,
      fechaInicio,
      fechaFin,
      brent,
      condicionesPago,
      montoTotal,
      abono,
      destino,
      fechaEnvio,
      estadoEntrega,
      clausulas,
      observacion,
      createdBy: req.usuario._id, // ID del usuario que creó el contrato
    });

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "El contrato debe incluir al menos un ítem en el campo 'items'.",
      });
    }

    // Guardar el contrato
    await nuevoContrato.save();

    // Crear y guardar los ítems asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new ContratoItemsBK({
          ...item,
          idContrato: nuevoContrato.id,
        });
        return await nuevoItem.save();
      })
    );

    // Actualizar el contrato con los IDs de los ítems
    nuevoContrato.idItems = nuevosItems.map((item) => item.id);
    await nuevoContrato.save();

    // Poblar referencias y responder con el contrato creado
    await nuevoContrato.populate(populateOptions);
    res.status(201).json(nuevoContrato);
  } catch (err) {
    console.error("Error en contratoPost:", err);

    // Si ocurre un error, eliminar el contrato creado
    if (nuevoContrato && nuevoContrato.id) {
      await ContratoBK.findByIdAndDelete(nuevoContrato.id);
    }
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contrato existente
const contratoPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { items, abono, ...resto } = req.body;

  try {
    const antes = await ContratoBK.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    // Validar que el contrato exista
    const contratoExistente = await ContratoBK.findOne({
      _id: id,
      eliminado: false,
    });
    if (!contratoExistente) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    // Actualizar el contrato
    const contratoActualizado = await ContratoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        abono,
        $push: {
          historialModificaciones: { usuario: req.usuario._id, cambios },
        },
      },
      { new: true }
    );

    // Actualizar o crear los ítems asociados al contrato
    if (items) {
      const nuevosItems = await Promise.all(
        items.map(async (item) => {
          if (item.id) {
            // Si el ítem tiene un ID, actualizarlo
            return await ContratoItemsBK.findByIdAndUpdate(item.id, item, {
              new: true,
            });
          } else {
            // Si el ítem no tiene un ID, crearlo
            const nuevoItem = new ContratoItemsBK({
              ...item,
              idContrato: id,
            });
            return await nuevoItem.save();
          }
        })
      );

      // Actualizar el contrato con los IDs de los ítems
      contratoActualizado.idItems = nuevosItems.map((item) => item.id);
      await contratoActualizado.save();
    }

    // Poblar referencias y responder con el contrato actualizado
    await contratoActualizado.populate(populateOptions);
    res.json(contratoActualizado);
  } catch (err) {
    console.error("Error en contratoPut:", err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contrato
const contratoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await ContratoBK.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const contratoEliminado = await ContratoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: {
          historialModificaciones: { usuario: req.usuario._id, cambios },
        },
      },
      { new: true }
    ).populate(populateOptions);

    if (!contratoEliminado) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    res.json(contratoEliminado);
  } catch (err) {
    console.error("Error en contratoDelete:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  contratoPost,
  contratoGet,
  contratoGets,
  contratoPut,
  contratoDelete,
};
