const { response, request } = require("express");
const Cuenta = require("../models/cuenta");
const Contrato = require("../models/contrato");

// Opciones de población reutilizables
const populateOptions = [
  {
    path: "idContrato",
    select: "numeroContrato tipoContrato montoTotal descripcion estadoContrato",
    // populate: [
    //   { path: "idItems", populate: [{ path: "producto", select: "nombre" }, { path: "idTipoProducto", select: "nombre" }] },
    // ],
  },
  {
    path: "idContacto",
    select: "nombre telefono email direccion",
  },
];

// Controlador para obtener todas las cuentas
const cuentaGets = async (req = request, res = response) => {
  const query = {}; // Puedes agregar filtros si es necesario

  try {
    const [total, cuentas] = await Promise.all([
      Cuenta.countDocuments(query), // Cuenta el total de cuentas
      Cuenta.find(query).populate(populateOptions), // Usa las opciones de población
    ]);

    res.json({ total, cuentas }); // Responde con el total y la lista de cuentas
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
    const cuenta = await Cuenta.findById(id).populate(populateOptions);

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
    // Buscar el contrato asociado
    const contrato = await Contrato.findById(idContrato).populate("idContacto", "nombre");

    if (!contrato) {
      return res.status(404).json({
        msg: "El contrato no fue encontrado.",
      });
    }

    // Determinar el tipo de cuenta según el tipo de contrato
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

    // Crear la nueva cuenta
    const nuevaCuenta = new Cuenta({
      idContrato: contrato._id,
      tipoCuenta,
      idContacto: contrato.idContacto, // Asociar el contacto del contrato
      abonos: contrato.abono || [],
      montoTotalContrato: contrato.montoTotal || 0,
    });

    // Guardar la cuenta
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
    const cuentaActualizada = await Cuenta.findByIdAndUpdate(id, resto, {
      new: true,
    }).populate(populateOptions);

    if (!cuentaActualizada) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    res.json(cuentaActualizada);
  } catch (err) {
    console.error("Error en cuentaPut:", err);
    res.status(400).json({
      error: "Error interno del servidor al actualizar la cuenta.",
    });
  }
};

// Controlador para eliminar (marcar como eliminado) una cuenta
const cuentaDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const cuentaEliminada = await Cuenta.findByIdAndDelete(id);

    if (!cuentaEliminada) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    res.json(cuentaEliminada);
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

    const cuenta = await Cuenta.syncFromContrato(contrato);

    res.json(cuenta);
  } catch (err) {
    console.error("Error en cuentaSyncFromContrato:", err);
    res.status(500).json({
      error: "Error interno del servidor al sincronizar la cuenta.",
    });
  }
};

module.exports = {
  cuentaGets, // Obtener todas las cuentas
  cuentaGet, // Obtener una cuenta específica por ID
  cuentaPostFromContrato, // Crear una nueva cuenta desde un contrato
  cuentaPut, // Actualizar una cuenta existente
  cuentaDelete, // Eliminar una cuenta
  cuentaSyncFromContrato, // Sincronizar una cuenta desde un contrato
};