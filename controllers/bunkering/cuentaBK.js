const { response, request } = require("express");
const CuentaBK = require("../../models/bunkering/cuentaBK");
const ContratoBK = require("../../models/bunkering/contratoBK");

// Opciones de población reutilizables
const cuentaBKPopulateOptions = [
  {
    path: "idContrato",
    select: "numeroContrato tipoContrato montoTotal descripcion estadoContrato",
  },
  {
    path: "idContacto",
    select: "nombre telefono email direccion",
  },
];

// Controlador para obtener todas las cuentasBK
const cuentasBKGets = async (req = request, res = response) => {
  const filtro = { eliminado: false }; // Filtro para obtener solo cuentas no eliminadas

  try {
    const [total, cuentasBK] = await Promise.all([
      CuentaBK.countDocuments(filtro),
      CuentaBK.find(filtro).populate(cuentaBKPopulateOptions),
    ]);

    res.json({ total, cuentasBK });
  } catch (err) {
    console.error("Error en cuentasBKGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener las cuentasBK.",
    });
  }
};

// Controlador para obtener una cuentaBK específica por ID
const cuentaBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const cuentaBK = await CuentaBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(cuentaBKPopulateOptions);

    if (!cuentaBK) {
      return res.status(404).json({ msg: "CuentaBK no encontrada" });
    }

    res.json(cuentaBK);
  } catch (err) {
    console.error("Error en cuentaBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener la cuentaBK.",
    });
  }
};

// Controlador para crear una nueva cuentaBK desde un contrato
const cuentaBKPostFromContrato = async (req = request, res = response) => {
  const { idContrato } = req.body;

  try {
    const contrato = await ContratoBK.findById(idContrato).populate(
      "idContacto",
      "nombre"
    );

    if (!contrato) {
      return res.status(404).json({
        msg: "El contrato no fue encontrado.",
      });
    }

    let tipoCuentaBK;
    if (contrato.tipoContrato === "Venta") {
      tipoCuentaBK = "CuentaBKs por Cobrar";
    } else if (contrato.tipoContrato === "Compra") {
      tipoCuentaBK = "CuentaBKs por Pagar";
    } else {
      return res.status(400).json({
        msg: "El tipo de contrato no es válido. Debe ser 'Venta' o 'Compra'.",
      });
    }

    const nuevaCuentaBK = new CuentaBK({
      idContrato: contrato._id,
      tipoCuentaBK,
      idContacto: contrato.idContacto,
      abonos: contrato.abono || [],
      montoTotalContrato: contrato.montoTotal || 0,
      createdBy: req.usuario._id, // ID del usuario que creó la cuentaBK
    });

    await nuevaCuentaBK.save();

    res.status(201).json({
      msg: "CuentaBK creada correctamente desde el contrato.",
      cuentaBK: nuevaCuentaBK,
    });
  } catch (err) {
    console.error("Error en cuentaBKPostFromContrato:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al crear la cuentaBK desde el contrato.",
    });
  }
};

// Controlador para actualizar una cuentaBK existente
const cuentaBKPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...datosActualizados } = req.body;

  try {
    const cuentaBKAnterior = await CuentaBK.findById(id);
    const cambios = {};
    for (let key in datosActualizados) {
      if (String(cuentaBKAnterior[key]) !== String(datosActualizados[key])) {
        cambios[key] = {
          from: cuentaBKAnterior[key],
          to: datosActualizados[key],
        };
      }
    }

    const cuentaBKActualizada = await CuentaBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...datosActualizados,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(cuentaBKPopulateOptions);

    if (!cuentaBKActualizada) {
      return res.status(404).json({ msg: "CuentaBK no encontrada" });
    }

    res.json(cuentaBKActualizada);
  } catch (err) {
    console.error("Error en cuentaBKPut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la cuentaBK.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) una cuentaBK
const cuentaBKDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const cuentaBKEliminada = await CuentaBK.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(cuentaBKPopulateOptions);

    if (!cuentaBKEliminada) {
      return res.status(404).json({ msg: "CuentaBK no encontrada" });
    }

    res.json({
      msg: "CuentaBK eliminada correctamente.",
      cuentaBK: cuentaBKEliminada,
    });
  } catch (err) {
    console.error("Error en cuentaBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar la cuentaBK.",
    });
  }
};

// Controlador para sincronizar una cuentaBK desde un contrato
const cuentaBKSycnFromContrato = async (req = request, res = response) => {
  const { contratoId } = req.params;

  try {
    const contrato = await ContratoBK.findById(contratoId);

    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    const cuentaBKSincronizada = await CuentaBK.syncFromContrato(contrato);

    res.json({
      msg: "CuentaBK sincronizada correctamente desde el contrato.",
      cuentaBK: cuentaBKSincronizada,
    });
  } catch (err) {
    console.error("Error en cuentaBKSycnFromContrato:", err);
    res.status(500).json({
      error: "Error interno del servidor al sincronizar la cuentaBK.",
    });
  }
};

module.exports = {
  cuentasBKGets,
  cuentaBKGet,
  cuentaBKPostFromContrato,
  cuentaBKPut,
  cuentaBKDelete,
  cuentaBKSycnFromContrato,
};
