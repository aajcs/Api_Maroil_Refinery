const { response, request } = require("express");
const Bunker = require("../../models/bunker/bunker");

// Obtener todas las refinerías con paginación y población de referencias
const bunkersGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, bunkers] = await Promise.all([
      Bunker.countDocuments(query),
      Bunker.find(query),
      // .populate({
      //   path: "idContacto",
      //   select: "nombre",
      // })
      // .populate({
      //   path: "idLinea",
      //   select: "nombre",
      // }),
    ]);

    res.json({
      total,
      bunkers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una refinería específica por ID
const bunkersGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const bunker = await Bunker.findOne({
      _id: id,
      eliminado: false,
    });
    // .populate({
    //   path: "idContacto",
    //   select: "nombre",
    // })
    // .populate({
    //   path: "idLinea",
    //   select: "nombre",
    // });

    if (!bunker) {
      return res.status(404).json({ msg: "Refinería no encontrada" });
    }

    res.json(bunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva refinería
const bunkersPost = async (req = request, res = response) => {
  const { ubicacion, nombre, nit, img, idContacto, idLinea } = req.body;

  try {
    const nuevaBunker = new Bunker({
      ubicacion,
      nombre,
      nit,
      img,
      idContacto,
      idLinea,
    });

    await nuevaBunker.save();

    res.status(201).json(nuevaBunker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una refinería existente
const bunkersPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const bunkerActualizada = await Bunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    );

    if (!bunkerActualizada) {
      return res.status(404).json({ msg: "Refinería no encontrada" });
    }

    req.io.emit("bunker-modificada", bunkerActualizada);
    res.json(bunkerActualizada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una refinería
const bunkersDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const bunker = await Bunker.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    );

    if (!bunker) {
      return res.status(404).json({ msg: "Refinería no encontrada" });
    }

    res.json(bunker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una refinería (ejemplo básico)
const bunkersPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - bunkersPatch",
  });
};

module.exports = {
  bunkersPost,
  bunkersGet,
  bunkersGets,
  bunkersPut,
  bunkersDelete,
  bunkersPatch,
};
