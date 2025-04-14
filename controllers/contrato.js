const { response, request } = require("express");
const Contrato = require("../models/contrato");
const contratoItems = require("../models/contratoItems");
const Cuenta = require("../models/cuenta"); // Importar el modelo Cuenta

// Opciones de población reutilizables para consultas
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
      { path: "idTipoProducto", select: "nombre" },
    ],
  },
];

// Obtener todos los contratos
const contratoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contratos] = await Promise.all([
      Contrato.countDocuments(query),
      Contrato.find(query).populate(populateOptions),
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
    const contrato = await Contrato.findOne({
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
    items,
    montoTotal,
    numeroContrato,
    plazo,
    tipoContrato,
    observacion,
    brent,
  } = req.body;

  let nuevoContrato;

  try {
    // Crear el contrato
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
      brent,
    });

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "El contrato debe incluir al menos un item en el campo 'items'.",
      });
    }

    // Guardar el contrato
    await nuevoContrato.save();

    // Crear y guardar los ítems asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new contratoItems({
          ...item,
          idContrato: nuevoContrato.id,
        });
        return await nuevoItem.save();
      })
    );

    // Actualizar el contrato con los IDs de los ítems
    nuevoContrato.idItems = nuevosItems.map((item) => item.id);
    await nuevoContrato.save();

    // Crear la cuenta asociada al contrato
    const nuevaCuenta = new Cuenta({
      idContrato: nuevoContrato._id,
      idContacto: nuevoContrato.idContacto,
      tipoCuenta:
        tipoContrato === "Venta" ? "Cuentas por Cobrar" : "Cuentas por Pagar",
      abonos: abono || [],
      montoTotalContrato: montoTotal || 0,
    });

    // Guardar la cuenta
    await nuevaCuenta.save();

    // Poblar referencias y responder con el contrato creado
    await nuevoContrato.populate(populateOptions);
    res.status(201).json(nuevoContrato);
  } catch (err) {
    console.error("Error en contratoPost:", err);

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
  const { items, abono, ...resto } = req.body;

  try {
    // Validar que el contrato exista
    const contratoExistente = await Contrato.findOne({
      _id: id,
      eliminado: false,
    });
    if (!contratoExistente) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    // Validar que el campo 'items' sea un array válido
    if (items && !Array.isArray(items)) {
      return res
        .status(400)
        .json({ error: "El campo 'items' debe ser un array válido." });
    }

    // Detectar nuevos abonos
    let nuevosAbonos = [];
    if (abono && Array.isArray(abono)) {
      const abonosExistentes = contratoExistente.abono.map((a) =>
        JSON.stringify(a)
      );
      nuevosAbonos = abono.filter(
        (a) => !abonosExistentes.includes(JSON.stringify(a))
      );
    }

    // Actualizar el contrato
    const contratoActualizado = await Contrato.findOneAndUpdate(
      { _id: id, eliminado: false },
      { ...resto, abono },
      { new: true }
    );

    // Actualizar o crear los ítems asociados al contrato
    if (items) {
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

      // Actualizar el contrato con los IDs de los ítems
      contratoActualizado.idItems = nuevosItems.map((item) => item.id);
      await contratoActualizado.save();
    }

    // Sincronizar la cuenta asociada al contrato
    let cuentaExistente = await Cuenta.findOne({ idContrato: id });

    // Usar el montoTotal del contrato existente
    const montoTotalContrato = contratoExistente.montoTotal;

    if (!montoTotalContrato || montoTotalContrato <= 0) {
      return res.status(400).json({
        error:
          "El monto total del contrato no es válido. Asegúrate de que el contrato tenga un monto total mayor a 0.",
      });
    }

    if (!cuentaExistente) {
      // Si no existe la cuenta, crearla
      const nuevaCuenta = new Cuenta({
        idContrato: contratoActualizado._id,
        idContacto: contratoActualizado.idContacto,
        tipoCuenta:
          contratoActualizado.tipoContrato === "Venta"
            ? "Cuentas por Cobrar"
            : "Cuentas por Pagar",
        abonos: contratoActualizado.abono || [],
        montoTotalContrato,
      });

      await nuevaCuenta.save();
    } else {
      // Si existe la cuenta, actualizar los campos necesarios
      cuentaExistente.idContacto =
        contratoActualizado.idContacto || cuentaExistente.idContacto;
      cuentaExistente.montoTotalContrato = montoTotalContrato;

      // Agregar los nuevos abonos a la cuenta
      if (nuevosAbonos.length > 0) {
        cuentaExistente.abonos.push(...nuevosAbonos);
      }

      await cuentaExistente.save();
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
    console.error("Error en contratoDelete:", err);
    res.status(500).json({ error: err.message });
  }
};

// Manejar solicitudes PATCH
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
