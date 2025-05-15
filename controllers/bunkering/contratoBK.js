const { response, request } = require("express");
const ContratoBK = require("../../models/bunkering/contratoBK");
const ContratoItemsBK = require("../../models/bunkering/contratoItemsBK");
const CuentaBK = require("../../models/bunkering/cuentaBK");

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

// Obtener todos los contratoBKs
const contratoBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contratoBKs] = await Promise.all([
      ContratoBK.countDocuments(query),
      ContratoBK.find(query).populate(populateOptions),
    ]);

    res.json({ total, contratoBKs });
  } catch (err) {
    console.error("Error en contratoBKGets:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Obtener un contratoBK específico por ID
const contratoBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contratoBK = await ContratoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!contratoBK) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    res.json(contratoBK);
  } catch (err) {
    console.error("Error en contratoBKGet:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Crear un nuevo contratoBK
const contratoBKPost = async (req = request, res = response) => {
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
    // Crear el contratoBK
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
      createdBy: req.usuario._id,
    });

    if (!items || items.length === 0) {
      return res.status(400).json({
        error:
          "El contratoBK debe incluir al menos un ítem en el campo 'items'.",
      });
    }

    // Guardar el contratoBK
    await nuevoContrato.save();

    // Crear y guardar los ítems asociados al contratoBK
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new ContratoItemsBK({
          ...item,
          idContrato: nuevoContrato.id,
        });
        return await nuevoItem.save();
      })
    );

    // Actualizar el contratoBK con los IDs de los ítems
    nuevoContrato.idItems = nuevosItems.map((item) => item.id);
    await nuevoContrato.save();

    // Crear la cuenta asociada al contratoBK
    const nuevaCuentaBK = new CuentaBK({
      idContrato: nuevoContrato._id,
      idContacto: nuevoContrato.idContacto,
      tipoCuentaBK:
        tipoContrato === "Venta"
          ? "CuentaBKs por Cobrar"
          : "CuentaBKs por Pagar",
      abonos: abono || [],
      montoTotalContrato: montoTotal || 0,
    });

    // Guardar la cuenta
    await nuevaCuentaBK.save();

    // Poblar referencias y responder con el contratoBK creado
    await nuevoContrato.populate(populateOptions);
    res.status(201).json(nuevoContrato);
  } catch (err) {
    console.error("Error en contratoBKPost:", err);

    // Si ocurre un error, eliminar el contratoBK creado
    if (nuevoContrato && nuevoContrato.id) {
      await ContratoBK.findByIdAndDelete(nuevoContrato.id);
    }
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contratoBK existente
const contratoBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { items, abono, ...resto } = req.body;

  try {
    const contratoBKExistente = await ContratoBK.findOne({
      _id: id,
      eliminado: false,
    });

    if (!contratoBKExistente) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(contratoBKExistente[key]) !== String(resto[key])) {
        cambios[key] = { from: contratoBKExistente[key], to: resto[key] };
      }
    }

    // Actualizar el contratoBK
    const contratoBKActualizado = await ContratoBK.findOneAndUpdate(
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

    // Actualizar o crear los ítems asociados al contratoBK
    if (items) {
      const nuevosItems = await Promise.all(
        items.map(async (item) => {
          if (item.id) {
            return await ContratoItemsBK.findByIdAndUpdate(item.id, item, {
              new: true,
            });
          } else {
            const nuevoItem = new ContratoItemsBK({
              ...item,
              idContrato: id,
            });
            return await nuevoItem.save();
          }
        })
      );

      contratoBKActualizado.idItems = nuevosItems.map((item) => item.id);
      await contratoBKActualizado.save();
    }

    // Sincronizar la cuenta asociada al contratoBK
    await CuentaBK.syncFromContrato(contratoBKActualizado);

    // Poblar referencias y responder con el contratoBK actualizado
    await contratoBKActualizado.populate(populateOptions);
    res.json(contratoBKActualizado);
  } catch (err) {
    console.error("Error en contratoBKPut:", err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contratoBK
const contratoBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contratoBKEliminado = await ContratoBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!contratoBKEliminado) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    res.json(contratoBKEliminado);
  } catch (err) {
    console.error("Error en contratoBKDelete:", err);
    res.status(500).json({ error: err.message });
  }
};

// Manejar solicitudes PATCH
const contratoBKPatch = (req = request, res = response) => {
  res.json({
    msg: "PATCH API - contratoBKPatch",
  });
};

module.exports = {
  contratoBKPost,
  contratoBKGet,
  contratoBKGets,
  contratoBKPut,
  contratoBKDelete,
  contratoBKPatch,
};
