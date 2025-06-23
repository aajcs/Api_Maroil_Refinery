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
  { path: "createdBy", select: "nombre correo" }, // Popula quién creó la torre
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  }, // Popula historial.modificadoPor en el array
];

// Obtener todos los contratos
const contratoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, contratos] = await Promise.all([
      Contrato.countDocuments(query),
      Contrato.find(query).populate(populateOptions),
    ]);
    // Ordenar historial por fecha ascendente en cada torre
    contratos.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
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

    // Ordenar historial por fecha descendente
    if (Array.isArray(contrato.historial)) {
      contrato.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

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
// Crear un nuevo contrato
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
    // Calcular montoPagado y montoPendiente según reglas de negocio
    let montoPagado = 0;
    if (abono && Array.isArray(abono)) {
      montoPagado = abono.reduce((sum, a) => sum + (a.monto || 0), 0);
    }
    // Validar que los abonos no excedan el monto total ni dejen pendiente menor a 0
    if (montoPagado > montoTotal) {
      return res.status(400).json({
        error: "La suma de los abonos no puede ser mayor al monto total.",
      });
    }
    let montoPendiente = montoTotal - montoPagado;
    if (montoPendiente < 0) {
      return res.status(400).json({
        error: "El monto pendiente no puede ser menor a 0.",
      });
    }
    if (montoPendiente > montoTotal) montoPendiente = montoTotal;

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
      montoPagado,
      montoPendiente,
      numeroContrato,
      plazo,
      tipoContrato,
      observacion,
      brent,
      createdBy: req.usuario._id,
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
      idRefineria: nuevoContrato.idRefineria,
      tipoCuenta:
        tipoContrato === "Venta" ? "Cuentas por Cobrar" : "Cuentas por Pagar",
      abonos: abono || [],
      montoTotalContrato: montoTotal || 0,
      montoPagado: montoPagado,
      montoPendiente: montoPendiente,
    });

    // Guardar la cuenta
    await nuevaCuenta.save();

    // Validar balance pendiente después de todas las operaciones
    if (nuevoContrato.montoPendiente < 0) {
      // Revertir todo si el balance es inválido
      await Cuenta.findByIdAndDelete(nuevaCuenta._id);
      await Promise.all(
        nuevosItems.map(
          async (item) => await contratoItems.findByIdAndDelete(item.id)
        )
      );
      await Contrato.findByIdAndDelete(nuevoContrato.id);
      return res.status(400).json({
        error:
          "El monto pendiente no puede ser menor a 0. Operación revertida.",
      });
    }

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

const contratoPut = async (req, res = response) => {
  const { id } = req.params;
  const { items, abono, ...resto } = req.body;

  try {
    const antes = await Contrato.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }
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

    // Calcular montoPagado y montoPendiente con los nuevos abonos
    let montoPagado = 0;
    let abonosFinal = contratoExistente.abono || [];

    if (abono && Array.isArray(abono)) {
      abonosFinal = abono; // Usar el array de abonos actualizado
      montoPagado = abonosFinal.reduce((sum, a) => sum + (a.monto || 0), 0);
    } else {
      montoPagado = abonosFinal.reduce((sum, a) => sum + (a.monto || 0), 0);
    }

    // Usar el montoTotal actualizado si viene en el body, si no, el existente
    const montoTotalContrato =
      typeof resto.montoTotal === "number"
        ? resto.montoTotal
        : contratoExistente.montoTotal;

    // Validar que los abonos no excedan el monto total ni dejen pendiente menor a 0
    if (montoPagado > montoTotalContrato) {
      return res.status(400).json({
        error: "La suma de los abonos no puede ser mayor al monto total.",
      });
    }
    let montoPendiente = montoTotalContrato - montoPagado;
    if (montoPendiente < 0) {
      return res.status(400).json({
        error: "El monto pendiente no puede ser menor a 0.",
      });
    }
    if (montoPendiente > montoTotalContrato)
      montoPendiente = montoTotalContrato;

    // Actualizar el contrato
    const contratoActualizado = await Contrato.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        abono: abonosFinal,
        montoPagado,
        montoPendiente,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    );

    // Actualizar o crear los ítems asociados al contrato
    let nuevosItems = [];
    if (items) {
      nuevosItems = await Promise.all(
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
        montoTotalContrato: montoTotalContrato,
        montoPagado: montoPagado,
        montoPendiente: montoPendiente,
      });

      await nuevaCuenta.save();
    } else {
      // Si existe la cuenta, actualizar los campos necesarios
      cuentaExistente.idContacto =
        contratoActualizado.idContacto || cuentaExistente.idContacto;
      cuentaExistente.montoTotalContrato = montoTotalContrato;
      cuentaExistente.abonos = contratoActualizado.abono || [];
      cuentaExistente.montoPagado = montoPagado;
      cuentaExistente.montoPendiente = montoPendiente;
      await cuentaExistente.save();
    }

    // Validar balance pendiente después de todas las operaciones
    if (contratoActualizado.montoPendiente < 0) {
      // Revertir cambios si el balance es inválido
      if (cuentaExistente) {
        cuentaExistente.abonos = contratoExistente.abono || [];
        cuentaExistente.montoTotalContrato = contratoExistente.montoTotal;
        cuentaExistente.montoPagado = contratoExistente.montoPagado;
        cuentaExistente.montoPendiente = contratoExistente.montoPendiente;
        await cuentaExistente.save();
      }
      if (nuevosItems && nuevosItems.length > 0) {
        await Promise.all(
          nuevosItems.map(async (item) => {
            if (
              item &&
              item.id &&
              !contratoExistente.idItems.includes(item.id)
            ) {
              await contratoItems.findByIdAndDelete(item.id);
            }
          })
        );
      }
      await Contrato.findByIdAndUpdate(id, {
        abono: contratoExistente.abono,
        montoPagado: contratoExistente.montoPagado,
        montoPendiente: contratoExistente.montoPendiente,
      });
      return res.status(400).json({
        error:
          "El monto pendiente no puede ser menor a 0. Operación revertida.",
      });
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
    // Auditoría: captura estado antes de eliminar
    const antes = await Contrato.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };
    const contrato = await Contrato.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
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
