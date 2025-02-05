const { response, request } = require("express");
const Contrato = require("../models/contrato");

// Obtener todos los contratos con paginación y población de referencias
const contratoGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  try {
    const [total, contratos] = await Promise.all([
      Contrato.countDocuments(query),
      Contrato.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate("id_empresa", "nombre"),
    ]);

    res.json({
      total,
      contratos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un contrato específico por ID
const contratoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const contrato = await Contrato.findById(id).populate("id_empresa", "nombre");

    if (contrato && !contrato.eliminado) {
      res.json(contrato);
    } else {
      res.status(404).json({
        msg: "Contrato no encontrado o eliminado",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo contrato
const contratoPost = async (req, res = response) => {
  const {
numeroContrato,
id_empresa,
producto,
fechaInicio,
fechaFin,
cantidad,
precioUnitario,
moneda,
condicionesPago,
plazo,
gravedadAPI,
azufre,
viscosidad,
densidad,
contenidoAgua,
origen,
destino,
temperatura,
presion,
transportista,
fechaEnvio,
estadoEntrega,
clausulas,
  } = req.body;

  const nuevoContrato = new Contrato({
    numeroContrato,
id_empresa,
producto,
fechaInicio,
fechaFin,
cantidad,
precioUnitario,
moneda,
condicionesPago,
plazo,
gravedadAPI,
azufre,
viscosidad,
densidad,
contenidoAgua,
origen,
destino,
temperatura,
presion,
transportista,
fechaEnvio,
estadoEntrega,
clausulas,
  });

  try {
    await nuevoContrato.save();
    res.json({ contrato: nuevoContrato });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contrato existente
const contratoPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const contratoActualizado = await Contrato.findByIdAndUpdate(id, resto, { new: true })
      .populate("id_empresa", "nombre");

    if (!contratoActualizado) {
      return res.status(404).json({
        msg: "Contrato no encontrado",
      });
    }

    res.json(contratoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un contrato
const contratoDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const contrato = await Contrato.findByIdAndUpdate(id, { eliminado: true }, { new: true });

    if (!contrato) {
      return res.status(404).json({
        msg: "Contrato no encontrado",
      });
    }

    res.json(contrato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Parchear un contrato (ejemplo básico)
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