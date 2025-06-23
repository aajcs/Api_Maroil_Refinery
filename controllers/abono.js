const { response, request } = require("express");
const Abono = require("../models/abono");
const Contrato = require("../models/contrato");
const Cuenta = require("../models/cuenta");

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato",
    select:
      "numeroContrato descripcion montoTotal montoPagado montoPendiente abono",
  },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todos los abonos, con info de contrato y cuenta asociada
const abonoGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, abonos] = await Promise.all([
      Abono.countDocuments(query),
      Abono.find(query).populate(populateOptions),
    ]);

    // Obtener contratos y cuentas asociadas a los abonos
    const contratosIds = abonos.map((a) => a.idContrato);
    const contratos = await Contrato.find({ _id: { $in: contratosIds } });
    const cuentas = await Cuenta.find({ idContrato: { $in: contratosIds } });

    // Ordenar historial por fecha descendente en cada abono
    abonos.forEach((a) => {
      if (Array.isArray(a.historial)) {
        a.historial.sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
      }
      // Agregar info de contrato y cuenta asociada
      a._doc.contrato = contratos.find((c) => c._id.equals(a.idContrato));
      a._doc.cuenta = cuentas.find((c) => c.idContrato.equals(a.idContrato));
    });

    res.json({ total, abonos });
  } catch (err) {
    console.error("Error en abonoGets:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Obtener un abono específico por ID, con info de contrato y cuenta asociada
const abonoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const abono = await Abono.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!abono) {
      return res.status(404).json({ msg: "Abono no encontrado" });
    }

    if (Array.isArray(abono.historial)) {
      abono.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    // Buscar contrato y cuenta asociada
    const contrato = await Contrato.findById(abono.idContrato);
    const cuenta = await Cuenta.findOne({ idContrato: abono.idContrato });

    abono._doc.contrato = contrato || null;
    abono._doc.cuenta = cuenta || null;

    res.json(abono);
  } catch (err) {
    console.error("Error en abonoGet:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Crear un nuevo abono, agregarlo al contrato y actualizar la cuenta asociada
const abonoPost = async (req = request, res = response) => {
  const { idContrato, monto, fecha, tipoOperacion, referencia } = req.body;

  try {
    // Validar que el contrato exista y no esté eliminado
    const contrato = await Contrato.findOne({
      _id: idContrato,
      eliminado: false,
    });
    if (!contrato) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }

    // Buscar la cuenta asociada al contrato
    const cuenta = await Cuenta.findOne({ idContrato: contrato._id });
    if (!cuenta) {
      return res
        .status(404)
        .json({ error: "Cuenta asociada al contrato no encontrada" });
    }

    // Crear el abono
    const nuevoAbono = new Abono({
      idContrato,
      monto,
      fecha,
      tipoOperacion,
      referencia,
      createdBy: req.usuario._id,
    });

    await nuevoAbono.save();
    await nuevoAbono.populate(populateOptions);

    // Agregar el abono al array del contrato
    contrato.abono.push({
      monto,
      fecha,
      tipoOperacion,
      referencia,
      eliminado: false,
    });

    // Actualizar los montos del contrato
    contrato.montoPagado += monto;
    contrato.montoPendiente = (contrato.montoTotal || 0) - contrato.montoPagado;
    await contrato.save();

    // Agregar el abono al array de la cuenta y actualizar saldo
    cuenta.abonos.push({
      monto,
      fecha,
      tipoOperacion,
      referencia,
      eliminado: false,
    });
    cuenta.saldo = (cuenta.saldo || 0) - monto;
    cuenta.montoPagado = (cuenta.montoPagado || 0) + monto;
    cuenta.montoPendiente =
      (cuenta.montoTotalContrato || 0) - cuenta.montoPagado;
    await cuenta.save();

    res.status(201).json(nuevoAbono);
  } catch (err) {
    console.error("Error en abonoPost:", err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un abono existente, sincronizar el contrato y la cuenta
const abonoPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { monto, fecha, tipoOperacion, referencia } = req.body;

  try {
    const abonoAntes = await Abono.findById(id);
    if (!abonoAntes) {
      return res.status(404).json({ msg: "Abono no encontrado" });
    }

    // Guardar cambios para auditoría
    const cambios = {};
    ["monto", "fecha", "tipoOperacion", "referencia"].forEach((key) => {
      if (String(abonoAntes[key]) !== String(req.body[key])) {
        cambios[key] = { from: abonoAntes[key], to: req.body[key] };
      }
    });

    // Actualizar el abono
    const abonoActualizado = await Abono.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        monto,
        fecha,
        tipoOperacion,
        referencia,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!abonoActualizado) {
      return res.status(404).json({ msg: "Abono no encontrado" });
    }

    // Actualizar el abono en el array del contrato
    const contrato = await Contrato.findById(abonoActualizado.idContrato);
    if (contrato) {
      const abonoContrato = contrato.abono.find(
        (a) =>
          a.monto === abonoAntes.monto &&
          a.fecha.getTime() === abonoAntes.fecha.getTime() &&
          a.tipoOperacion === abonoAntes.tipoOperacion &&
          a.referencia === abonoAntes.referencia &&
          a.eliminado === abonoAntes.eliminado
      );
      if (abonoContrato) {
        abonoContrato.monto = monto;
        abonoContrato.fecha = fecha;
        abonoContrato.tipoOperacion = tipoOperacion;
        abonoContrato.referencia = referencia;
      }
      // Recalcular los montos del contrato
      const abonosContrato = contrato.abono.filter((a) => !a.eliminado);
      contrato.montoPagado = abonosContrato.reduce(
        (sum, a) => sum + (a.monto || 0),
        0
      );
      contrato.montoPendiente =
        (contrato.montoTotal || 0) - contrato.montoPagado;
      await contrato.save();
    }

    // Actualizar el abono en el array de la cuenta y ajustar saldo
    const cuenta = await Cuenta.findOne({ idContrato: abonoAntes.idContrato });
    if (cuenta) {
      const abonoCuenta = cuenta.abonos.find(
        (a) =>
          a.monto === abonoAntes.monto &&
          a.fecha.getTime() === abonoAntes.fecha.getTime() &&
          a.tipoOperacion === abonoAntes.tipoOperacion &&
          a.referencia === abonoAntes.referencia &&
          a.eliminado === abonoAntes.eliminado
      );
      if (abonoCuenta) {
        abonoCuenta.monto = monto;
        abonoCuenta.fecha = fecha;
        abonoCuenta.tipoOperacion = tipoOperacion;
        abonoCuenta.referencia = referencia;
      }
      // Ajustar saldo y montos
      const diferencia = monto - abonoAntes.monto;
      cuenta.saldo = (cuenta.saldo || 0) - diferencia;
      // Recalcular montoPagado y montoPendiente en cuenta
      const abonosCuenta = cuenta.abonos.filter((a) => !a.eliminado);
      cuenta.montoPagado = abonosCuenta.reduce(
        (sum, a) => sum + (a.monto || 0),
        0
      );
      cuenta.montoPendiente =
        (cuenta.montoTotalContrato || 0) - cuenta.montoPagado;
      await cuenta.save();
    }

    res.json(abonoActualizado);
  } catch (err) {
    console.error("Error en abonoPut:", err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un abono, actualizar el contrato y la cuenta
const abonoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const abonoAntes = await Abono.findById(id);
    if (!abonoAntes) {
      return res.status(404).json({ msg: "Abono no encontrado" });
    }
    const cambios = { eliminado: { from: abonoAntes.eliminado, to: true } };

    const abono = await Abono.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!abono) {
      return res.status(404).json({ msg: "Abono no encontrado" });
    }

    // Marcar como eliminado en el array del contrato y actualizar montos
    const contrato = await Contrato.findById(abono.idContrato);
    if (contrato) {
      const abonoContrato = contrato.abono.find(
        (a) =>
          a.monto === abonoAntes.monto &&
          a.fecha.getTime() === abonoAntes.fecha.getTime() &&
          a.tipoOperacion === abonoAntes.tipoOperacion &&
          a.referencia === abonoAntes.referencia &&
          a.eliminado === abonoAntes.eliminado
      );
      if (abonoContrato) {
        abonoContrato.eliminado = true;
      }
      // Recalcular los montos del contrato
      const abonosContrato = contrato.abono.filter((a) => !a.eliminado);
      contrato.montoPagado = abonosContrato.reduce(
        (sum, a) => sum + (a.monto || 0),
        0
      );
      contrato.montoPendiente =
        (contrato.montoTotal || 0) - contrato.montoPagado;
      await contrato.save();
    }

    // Marcar como eliminado en el array de la cuenta y actualizar saldo
    const cuenta = await Cuenta.findOne({ idContrato: abonoAntes.idContrato });
    if (cuenta) {
      const abonoCuenta = cuenta.abonos.find(
        (a) =>
          a.monto === abonoAntes.monto &&
          a.fecha.getTime() === abonoAntes.fecha.getTime() &&
          a.tipoOperacion === abonoAntes.tipoOperacion &&
          a.referencia === abonoAntes.referencia &&
          a.eliminado === abonoAntes.eliminado
      );
      if (abonoCuenta) {
        abonoCuenta.eliminado = true;
      }
      // Recalcular saldo y montos
      cuenta.saldo = (cuenta.saldo || 0) + abonoAntes.monto;
      const abonosCuenta = cuenta.abonos.filter((a) => !a.eliminado);
      cuenta.montoPagado = abonosCuenta.reduce(
        (sum, a) => sum + (a.monto || 0),
        0
      );
      cuenta.montoPendiente =
        (cuenta.montoTotalContrato || 0) - cuenta.montoPagado;
      await cuenta.save();
    }

    res.json(abono);
  } catch (err) {
    console.error("Error en abonoDelete:", err);
    res.status(500).json({ error: err.message });
  }
};

const abonoPatch = (req, res = response) => {
  res.json({
    msg: "patch API - abonoPatch",
  });
};

module.exports = {
  abonoGets,
  abonoGet,
  abonoPost,
  abonoPut,
  abonoDelete,
  abonoPatch,
};
