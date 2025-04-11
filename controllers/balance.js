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
];

// Obtener todos los balances
const balanceGets = async (req, res = response) => {
  try {
    const balances = await Balance.find().populate(populateOptions);

    res.json({
      msg: "Balances obtenidos exitosamente.",
      balances,
    });
  } catch (err) {
    console.error("Error al obtener los balances:", err);
    res.status(500).json({
      msg: "Error interno del servidor.",
    });
  }
};

// Obtener un balance específico por ID
const balanceGet = async (req, res = response) => {
  const { id } = req.params;

  try {
    const balance = await Balance.findById(id).populate(populateOptions);

    if (!balance) {
      return res.status(404).json({
        msg: "Balance no encontrado.",
      });
    }

    res.json({
      msg: "Balance obtenido exitosamente.",
      balance,
    });
  } catch (err) {
    console.error("Error al obtener el balance:", err);
    res.status(500).json({
      msg: "Error interno del servidor.",
    });
  }
};

// Crear un nuevo balance
const balancePost = async (req, res = response) => {
  const { fechaInicio, fechaFin, contratosCompras, contratosVentas, facturas } =
    req.body;

  try {
    // Validar que las fechas sean válidas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        msg: "Debe proporcionar una fecha de inicio y una fecha de fin.",
      });
    }

    // Obtener los contratos de compra
    const compras = await Contrato.find({
      _id: { $in: contratosCompras },
      tipoContrato: "Compra",
      eliminado: false,
    });

    // Obtener los contratos de venta
    const ventas = await Contrato.find({
      _id: { $in: contratosVentas },
      tipoContrato: "Venta",
      eliminado: false,
    });

    // Obtener las facturas
    const facturasSeleccionadas = await Factura.find({
      _id: { $in: facturas },
    });

    // Calcular totales
    const totalCompras = compras.reduce(
      (total, compra) => total + (compra.montoTotal || 0),
      0
    );
    const totalVentas = ventas.reduce(
      (total, venta) => total + (venta.montoTotal || 0),
      0
    );
    const totalFacturas = facturasSeleccionadas.reduce(
      (total, factura) => total + (factura.total || 0), // Usar el campo `total` de las facturas
      0
    );

    // Calcular ganancia o pérdida
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
      totalVentas: totalVentas - totalFacturas, // Ventas netas después de restar facturas
      ganancia: ganancia > 0 ? ganancia : 0,
      perdida,
    });

    // Guardar el balance en la base de datos
    await nuevoBalance.save();

    // Popular el balance recién creado
    const balancePopulado = await Balance.findById(nuevoBalance._id).populate(
      populateOptions
    );

    res.json({
      msg: "Balance creado exitosamente.",
      balance: balancePopulado,
    });
  } catch (err) {
    console.error("Error al crear el balance:", err);
    res.status(500).json({
      msg: "Error interno del servidor.",
    });
  }
};

// Actualizar un balance específico por ID
const balancePut = async (req, res = response) => {
  const { id } = req.params;
  const { fechaInicio, fechaFin, contratosCompras, contratosVentas, facturas } =
    req.body;

  try {
    const balance = await Balance.findById(id);

    if (!balance) {
      return res.status(404).json({
        msg: "Balance no encontrado.",
      });
    }

    // Obtener los contratos de compra
    const compras = await Contrato.find({
      _id: { $in: contratosCompras },
      tipoContrato: "Compra",
      eliminado: false,
    });

    // Obtener los contratos de venta
    const ventas = await Contrato.find({
      _id: { $in: contratosVentas },
      tipoContrato: "Venta",
      eliminado: false,
    });

    // Obtener las facturas
    const facturasSeleccionadas = await Factura.find({
      _id: { $in: facturas },
    });

    // Calcular totales
    const totalCompras = compras.reduce(
      (total, compra) => total + (compra.montoTotal || 0),
      0
    );
    const totalVentas = ventas.reduce(
      (total, venta) => total + (venta.montoTotal || 0),
      0
    );
    const totalFacturas = facturasSeleccionadas.reduce(
      (total, factura) => total + (factura.total || 0), // Usar el campo `total` de las facturas
      0
    );

    // Calcular ganancia o pérdida
    const ganancia = totalVentas - totalCompras - totalFacturas;
    const perdida = ganancia < 0 ? Math.abs(ganancia) : 0;

    // Actualizar los campos del balance
    balance.fechaInicio = fechaInicio || balance.fechaInicio;
    balance.fechaFin = fechaFin || balance.fechaFin;
    balance.contratosCompras = contratosCompras || balance.contratosCompras;
    balance.contratosVentas = contratosVentas || balance.contratosVentas;
    balance.facturas = facturas || balance.facturas;
    balance.totalCompras = totalCompras;
    balance.totalVentas = totalVentas - totalFacturas; // Ventas netas después de restar facturas
    balance.ganancia = ganancia > 0 ? ganancia : 0;
    balance.perdida = perdida;

    // Guardar los cambios
    await balance.save();

    res.json({
      msg: "Balance actualizado exitosamente.",
      balance,
    });
  } catch (err) {
    console.error("Error al actualizar el balance:", err);
    res.status(500).json({
      msg: "Error interno del servidor.",
    });
  }
};

// Eliminar un balance específico por ID
const balanceDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const balance = await Balance.findByIdAndDelete(id);

    if (!balance) {
      return res.status(404).json({
        msg: "Balance no encontrado.",
      });
    }

    res.json({
      msg: "Balance eliminado exitosamente.",
      balance,
    });
  } catch (err) {
    console.error("Error al eliminar el balance:", err);
    res.status(500).json({
      msg: "Error interno del servidor.",
    });
  }
};

// Actualización parcial de un balance
const balancePatch = async (req, res = response) => {
  const { id } = req.params;
  const cambios = req.body;

  try {
    const balance = await Balance.findByIdAndUpdate(id, cambios, {
      new: true,
    }).populate(populateOptions);

    if (!balance) {
      return res.status(404).json({
        msg: "Balance no encontrado.",
      });
    }

    res.json({
      msg: "Balance actualizado parcialmente.",
      balance,
    });
  } catch (err) {
    console.error("Error al actualizar parcialmente el balance:", err);
    res.status(500).json({
      msg: "Error interno del servidor.",
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
