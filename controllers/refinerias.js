const { response, request } = require("express");
const Refineria = require("../models/refineria");

// Obtener todas las refinerías con paginación y población de referencias
const refineriasGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, refinerias] = await Promise.all([
      Refineria.countDocuments(query),
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
      refinerias,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una refinería específica por ID
const refineriasGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refineria = await Refineria.findOne({
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

    if (!refineria) {
      return res.status(404).json({ msg: "Refinería no encontrada" });
    }

    res.json(refineria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva refinería
const refineriasPost = async (req = request, res = response) => {
  const { ubicacion, nombre, nit, img, idContacto, idLinea } = req.body;

  try {
    const nuevaRefineria = new Refineria({
      ubicacion,
      nombre,
      nit,
      img,
      idContacto,
      idLinea,
    });

    await nuevaRefineria.save();

    await nuevaRefineria
      .populate({
        path: "idContacto",
        select: "nombre",
      })
      .populate({
        path: "idLinea",
        select: "nombre",
      });

    res.status(201).json(nuevaRefineria);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una refinería existente
const refineriasPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const refineriaActualizada = await Refineria.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    )
      .populate({
        path: "idContacto",
        select: "nombre",
      })
      .populate({
        path: "idLinea",
        select: "nombre",
      });

    if (!refineriaActualizada) {
      return res.status(404).json({ msg: "Refinería no encontrada" });
    }

    req.io.emit("refineria-modificada", refineriaActualizada);
    res.json(refineriaActualizada);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) una refinería
const refineriasDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refineria = await Refineria.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    )
      .populate({
        path: "idContacto",
        select: "nombre",
      })
      .populate({
        path: "idLinea",
        select: "nombre",
      });

    if (!refineria) {
      return res.status(404).json({ msg: "Refinería no encontrada" });
    }

    res.json(refineria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una refinería (ejemplo básico)
const refineriasPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refineriasPatch",
  });
};

module.exports = {
  refineriasPost,
  refineriasGet,
  refineriasGets,
  refineriasPut,
  refineriasDelete,
  refineriasPatch,
};
