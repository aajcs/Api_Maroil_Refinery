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
  { path: "idRefineria", select: "nombre img direccion" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

const balanceGets = async (req, res = response, next) => {
  // Busca balances donde eliminado sea false o no exista
  const query = {
    $or: [{ eliminado: false }, { eliminado: { $exists: false } }],
  };

  try {
    const [total, balances] = await Promise.all([
      Balance.countDocuments(query),
      Balance.find(query).populate(populateOptions).sort({ fechaInicio: -1 }),
    ]);

    res.json({ total, balances });
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Obtener un balance específico por ID
const balanceGet = async (req, res = response, next) => {
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
    next(err); // Propaga el error al middleware
  }
};

// Crear un nuevo balance
const balancePost = async (req, res = response, next) => {
  const {
    fechaInicio,
    fechaFin,
    contratosCompras,
    contratosVentas,
    facturas,
    idRefineria,
  } = req.body;

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
      idRefineria,
      createdBy: req.usuario._id,
    });

    await nuevoBalance.save();
    const balancePopulado = await Balance.findById(nuevoBalance._id).populate(
      populateOptions
    );

    res.status(201).json(balancePopulado);
  } catch (err) {
    next(err); // Propaga el error al middleware
  }
};

// Actualizar un balance existente
const balancePut = async (req, res = response, next) => {
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
    next(err); // Propaga el error al middleware
  }
};

// Actualizar parcialmente un balance existente
const balancePatch = async (req, res = response, next) => {
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
    next(err); // Propaga el error al middleware
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
    next(err); // Propaga el error al middleware
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
