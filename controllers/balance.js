const Balance = require("../models/balance");
const Contrato = require("../models/contrato");
const Factura = require("../models/factura");

// Opciones de población reutilizables
const populateOptions = [
  {
    path: "contratosCompras",
    select: "numeroContrato montoTotal tipoContrato",
  },
  { path: "contratosVentas", select: "numeroContrato montoTotal tipoContrato" },
  { path: "facturas", select: "total concepto fechaFactura" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todos los balances
const balanceGets = async (req, res = response) => {
  const query = { eliminado: false }; // Filtro para balances no eliminados

  try {
    const [total, balances] = await Promise.all([
      Balance.countDocuments(query),
      Balance.find(query).populate(populateOptions).sort({ fechaInicio: -1 }),
    ]);

    res.json({ total, balances });
  } catch (err) {
    console.error("Error en balanceGets:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener los balances.",
    });
  }
};

// Obtener un balance específico por ID
const balanceGet = async (req, res = response) => {
  const { id } = req.params;

  try {
    const balance = await Balance.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!balance) {
      return res.status(404).json({ msg: "Balance no encontrado." });
    }

    res.json(balance);
  } catch (err) {
    console.error("Error en balanceGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el balance.",
    });
  }
};

// Crear un nuevo balance
const balancePost = async (req, res = response) => {
  const { fechaInicio, fechaFin, contratosCompras, contratosVentas, facturas } =
    req.body;

  try {
    // Calcular totales
    const compras = await Contrato.find({
      _id: { $in: contratosCompras },
      tipoContrato: "Compra",
      eliminado: false,
    });
    const ventas = await Contrato.find({
      _id: { $in: contratosVentas },
      tipoContrato: "Venta",
      eliminado: false,
    });
    const facturasSeleccionadas = await Factura.find({
      _id: { $in: facturas },
    });

    const totalCompras = compras.reduce(
      (total, compra) => total + (compra.montoTotal || 0),
      0
    );
    const totalVentas = ventas.reduce(
      (total, venta) => total + (venta.montoTotal || 0),
      0
    );
    const totalFacturas = facturasSeleccionadas.reduce(
      (total, factura) => total + (factura.total || 0),
      0
    );

    const ganancia = totalVentas - totalCompras - totalFacturas;
    const perdida = ganancia < 0 ? Math.abs(ganancia) : 0;

    // Crear el balance
    const nuevoBalance = new Balance({
      fechaInicio,
      fechaFin,
      contratosCompras,
      contratosVentas,
      facturas,
      totalCompras,
      totalVentas: totalVentas - totalFacturas,
      ganancia: ganancia > 0 ? ganancia : 0,
      perdida,
      createdBy: req.usuario._id,
    });

    await nuevoBalance.save();
    const balancePopulado = await Balance.findById(nuevoBalance._id).populate(
      populateOptions
    );

    res.status(201).json(balancePopulado);
  } catch (err) {
    console.error("Error en balancePost:", err);
    res.status(500).json({
      error: "Error interno del servidor al crear el balance.",
    });
  }
};

// Actualizar un balance existente
const balancePut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await Balance.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Balance no encontrado." });
    }

    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }

    const balanceActualizado = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!balanceActualizado) {
      return res.status(404).json({ msg: "Balance no encontrado." });
    }

    res.json(balanceActualizado);
  } catch (err) {
    console.error("Error en balancePut:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el balance.",
    });
  }
};

// Actualizar parcialmente un balance existente
const balancePatch = async (req, res = response) => {
  const { id } = req.params;
  const { ...resto } = req.body;

  try {
    const balanceActualizado = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false },
      { $set: resto },
      { new: true }
    ).populate(populateOptions);

    if (!balanceActualizado) {
      return res.status(404).json({ msg: "Balance no encontrado." });
    }

    res.json(balanceActualizado);
  } catch (err) {
    console.error("Error en balancePatch:", err);
    res.status(500).json({
      error:
        "Error interno del servidor al actualizar parcialmente el balance.",
    });
  }
};

// Eliminar un balance (eliminación lógica)
const balanceDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const antes = await Balance.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Balance no encontrado." });
    }

    const cambios = { eliminado: { from: antes.eliminado, to: true } };

    const balance = await Balance.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!balance) {
      return res.status(404).json({ msg: "Balance no encontrado." });
    }

    res.json({
      msg: "Balance eliminado exitosamente.",
      balance,
    });
  } catch (err) {
    console.error("Error en balanceDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el balance.",
    });
  }
};

module.exports = {
  balanceGets,
  balanceGet,
  balancePost,
  balancePut,
  balanceDelete,
  balancePatch,
};
