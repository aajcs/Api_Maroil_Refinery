const { response, request } = require("express");
const LineaFactura = require("../models/lineaFactura");

// Opciones de población para traer subpartida en cada línea
const populateOptions = [
  { 
    path: "idSubPartida",
    populate: [
//  { path: "idRefineria" },
      { path: "idPartida", select: "descripcion" }
    ]
  },
  { 
    path: "idFactura",
    populate: { path: "idRefinerias", select: "nombre" }
  }
];

// Obtener todas las líneas de factura con subpartida poblada
const lineaFacturaGets = async (req = request, res = response, next) => {
  const query = { eliminado: false };

  try {
    const [total, lineas] = await Promise.all([
      LineaFactura.countDocuments(query),
      LineaFactura.find(query).populate(populateOptions),
    ]);

    res.json({ total, lineas });
  } catch (err) {
    next(err);
  }
};

// Obtener una línea de factura específica por ID con subpartida poblada
const lineaFacturaGet = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const linea = await LineaFactura.findById(id).populate(populateOptions);

    if (!linea) {
      return res.status(404).json({
        msg: "Línea de factura no encontrada",
      });
    }

    res.json(linea);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  lineaFacturaGets,
  lineaFacturaGet,
};