const { response, request } = require("express");

const Linea_carga = require("../models/linea_carga");

const linea_cargaGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  const [total, linea_cargas] = await Promise.all([
    Linea_carga.countDocuments(query),
    Linea_carga.find(query)
      .skip(Number(desde))
      .limit(Number(limite))
      .populate("id_empresa", "nombre"),
  ]);

  res.json({
    total,
    linea_cargas,
  });
};

const linea_cargaGet = async (req = request, res = response) => {
  const { id } = req.params;
  const linea_carga = await Linea_carga.findById(id).populate(
    "id_empresa",
    "nombre"
  );

  // Verificar si el campo eliminado es falso
  if (linea_carga && !linea_carga.eliminado) {
    res.json(linea_carga);
  } else {
    // Enviar una respuesta apropiada si el linea_carga no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Linea_carga no encontrado o eliminado",
    });
  }
};

const linea_cargaPost = async (req, res = response) => {
  const { ubicacion, numero, id_refineria } = req.body;
  const linea_carga = new Linea_carga({
    ubicacion,
    numero,
    id_refineria,
  });
  console.log(linea_carga);
  try {
    // Guardar en BD
    await linea_carga.save();
    await linea_carga.populate("id_refineria", "nombre"),
      res.json({
        linea_carga,
      });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const linea_cargaPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;
  const linea_carga = await Linea_carga.findByIdAndUpdate(id, resto, {
    new: true,
  });

  res.json(linea_carga);
};

const linea_cargaDelete = async (req, res = response) => {
  const { id } = req.params;
  const linea_carga = await Linea_carga.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(linea_carga);
};

const linea_cargaPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

module.exports = {
  linea_cargaPost,
  linea_cargaGet,
  linea_cargaGets,
  linea_cargaPut,
  linea_cargaDelete,
  linea_cargaPatch,
};
