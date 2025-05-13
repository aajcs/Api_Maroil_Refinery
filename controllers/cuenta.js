const { response, request } = require("express");
const Cuenta = require("../models/cuenta");
const Contrato = require("../models/contrato");

// Opciones de población reutilizables
const populateOptions = [
  {
    path: "idContrato",
    select: "numeroContrato tipoContrato montoTotal descripcion estadoContrato",
  },
  {
    path: "idContacto",
    select: "nombre telefono email direccion",
  },
];

// Controlador para obtener todas las cuentas
const cuentaGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo cuentas no eliminadas

  try {
    const [total, cuentas] = await Promise.all([
      Cuenta.countDocuments(query),
      Cuenta.find(query).populate(populateOptions),
    ]);

    res.json({ total, cuentas });
  } catch (err) {
    console.error("Error en cuentaGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las cuentas.",
    });
  }
};

// Controlador para obtener una cuenta específica por ID
const cuentaGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const cuenta = await Cuenta.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!cuenta) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    res.json(cuenta);
  } catch (err) {
    console.error("Error en cuentaGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la cuenta.",
    });
  }
};

// Controlador para crear una nueva cuenta desde un contrato
const cuentaPostFromContrato = async (req = request, res = response) => {
  const { idContrato } = req.body;

  try {
    const contrato = await Contrato.findById(idContrato).populate(
      "idContacto",
      "nombre"
    );

    if (!contrato) {
      return res.status(404).json({
        msg: "El contrato no fue encontrado.",
      });
    }

    let tipoCuenta;
    if (contrato.tipoContrato === "Venta") {
      tipoCuenta = "Cuentas por Cobrar";
    } else if (contrato.tipoContrato === "Compra") {
      tipoCuenta = "Cuentas por Pagar";
    } else {
      return res.status(400).json({
        msg: "El tipo de contrato no es válido. Debe ser 'Venta' o 'Compra'.",
      });
    }

    const nuevaCuenta = new Cuenta({
      idContrato: contrato._id,
      tipoCuenta,
      idContacto: contrato.idContacto,
      abonos: contrato.abono || [],
      montoTotalContrato: contrato.montoTotal || 0,
      createdBy: req.usuario._id, // ID del usuario que creó la cuenta
    });

    await nuevaCuenta.save();

    res.status(201).json({
      msg: "Cuenta creada correctamente desde el contrato.",
      cuenta: nuevaCuenta,
    });
  } catch (err) {
    console.error("Error en cuentaPostFromContrato:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear la cuenta desde el contrato.",
    });
  }
};

// Controlador para actualizar una cuenta existente
const cuentaPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await Cuenta.findById(id);
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const cuentaActualizada = await Cuenta.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!cuentaActualizada) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    res.json(cuentaActualizada);
  } catch (err) {
    console.error("Error en cuentaPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la cuenta.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) una cuenta
const cuentaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const antes = await Cuenta.findById(id);
    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const cuentaEliminada = await Cuenta.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!cuentaEliminada) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    res.json({
      msg: "Cuenta eliminada correctamente.",
      cuenta: cuentaEliminada,
    });
  } catch (err) {
    console.error("Error en cuentaDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la cuenta.",
    });
  }
};

// Controlador para sincronizar una cuenta desde un contrato
const cuentaSyncFromContrato = async (req = request, res = response) => {
  const { contratoId } = req.params;

  try {
    const contrato = await Contrato.findById(contratoId);

    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    const cuentaExistente = await Cuenta.findOne({ idContrato: contratoId });

    if (!cuentaExistente) {
      return res.status(404).json({ msg: "Cuenta no encontrada para sincronizar." });
    }

    const cambios = {};
    if (cuentaExistente.montoTotalContrato !== contrato.montoTotal) {
      cambios.montoTotalContrato = {
        from: cuentaExistente.montoTotalContrato,
        to: contrato.montoTotal,
      };
    }

    const cuentaSincronizada = await Cuenta.findOneAndUpdate(
      { idContrato: contratoId },
      {
        montoTotalContrato: contrato.montoTotal,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    res.json({
      msg: "Cuenta sincronizada correctamente desde el contrato.",
      cuenta: cuentaSincronizada,
    });
  } catch (err) {
    console.error("Error en cuentaSyncFromContrato:", err);
    res.status(500).json({
      error: "Error interno del servidor al sincronizar la cuenta.",
    });
  }
};

module.exports = {
  cuentaGets,
  cuentaGet,
  cuentaPostFromContrato,
  cuentaPut,
  cuentaDelete,
  cuentaSyncFromContrato,
};