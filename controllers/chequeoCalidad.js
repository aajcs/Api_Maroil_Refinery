const { response, request } = require("express");
const ChequeoCalidad = require("../models/chequeoCalidad");

// Obtener todos los chequeos de calidad con paginación y población de referencias
const chequeoCalidadGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, chequeoCalidads] = await Promise.all([
      ChequeoCalidad.countDocuments(query),
      ChequeoCalidad.find(query)
        .populate({
          path: "idProducto",
          select: "nombre",
        })
        .populate({
          path: "idTanque",
          select: "nombre",
        })
        .populate({
          path: "idTorre",
          select: "nombre",
        })
        .populate({
          path: "idRefineria",
          select: "nombre",
        }),
    ]);

    res.json({
      total,
      chequeoCalidads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de calidad específico por ID
const chequeoCalidadGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCalidad = await ChequeoCalidad.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    })
      .populate({
        path: "idProducto",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      });

    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoCalidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de calidad
const chequeoCalidadPost = async (req = request, res = response) => {
  const {
    idProducto,
    idTanque,
    idTorre,
    idRefineria,
    operador,
    fechaChequeo,
    gravedadAPI,
    azufre,
    viscosidad,
    densidad,
    contenidoAgua,
    contenidoPlomo,
    octanaje,
    temperatura,
  } = req.body;

  try {
    const nuevoChequeoCalidad = new ChequeoCalidad({
      idProducto,
      idTanque,
      idTorre,
      idRefineria,
      operador,
      fechaChequeo,
      gravedadAPI,
      azufre,
      viscosidad,
      densidad,
      contenidoAgua,
      contenidoPlomo,
      octanaje,
      temperatura,
    });

    await nuevoChequeoCalidad.save();

    await nuevoChequeoCalidad.populate([
      { path: "idProducto", select: "nombre" },
      { path: "idTanque", select: "nombre" },
      { path: "idTorre", select: "nombre" },
      { path: "idRefineria", select: "nombre" },
    ]);

    res.status(201).json(nuevoChequeoCalidad);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de calidad existente
const chequeoCalidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const chequeoCalidadActualizado = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    )
      .populate({
        path: "idProducto",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      });

    if (!chequeoCalidadActualizado) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoCalidadActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de calidad
const chequeoCalidadDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCalidad = await ChequeoCalidad.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    )
      .populate({
        path: "idProducto",
        select: "nombre",
      })
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      });

    if (!chequeoCalidad) {
      return res.status(404).json({ msg: "Chequeo de calidad no encontrado" });
    }

    res.json(chequeoCalidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de calidad (ejemplo básico)
const chequeoCalidadPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCalidadPatch",
  });
};

module.exports = {
  chequeoCalidadGets,
  chequeoCalidadGet,
  chequeoCalidadPost,
  chequeoCalidadPut,
  chequeoCalidadDelete,
  chequeoCalidadPatch,
};

// const { response, request } = require("express");
// const ChequeoCalidad = require("../models/chequeoCalidad");

// // Obtener todos los chequeoCalidads con paginación y población de referencias
// const chequeoCalidadGets = async (req = request, res = response) => {
//   const query = { estado: true };

//   try {
//     const [total, chequeoCalidads] = await Promise.all([
//       ChequeoCalidad.countDocuments(query),
//       ChequeoCalidad.find(query).populate({
//         path: "idRefineria",
//         select: "nombre",
//       }),

//     ]);

//     res.json({
//       total,
//       chequeoCalidads,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Obtener un chequeoCalidad específico por ID
// const  chequeoCalidadGet = async (req = request, res = response) => {
//   const { id } = req.params;

//   try {
//     const chequeoCalidad = await ChequeoCalidad.findOne({
//       _id: id,
//       estado: true,
//       eliminado: false,
//     })
//     .populate({
//       path: "idRefineria",
//       select: "nombre",
//     });

//     if (!chequeoCalidad) {
//       return res.status(404).json({ msg: "ChequeoCalidad no encontrado" });
//     }

//     res.json(chequeoCalidad);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Crear un nuevo chequeoCalidad
// const chequeoCalidadPost = async (req = request, res = response) => {
//    try {
//       const { idRefineria } = req.body;

//       if (!idRefineria) {
//         return res
//           .status(400)
//           .json({ error: "Nombre y Refinería son requeridos" });
//       }

//       const nuevoChequeoCalidad = await ChequeoCalidad.create({
//         ...req.body,
//       });

//       await nuevoChequeoCalidad
//       .populate({
//         path: "idRefineria",
//         select: "nombre",
//       })
//       .populate({
//         path: "idTanque",
//         select: "nombre",
//       })
//       .populate({
//         path: "idProducto",
//       })
//       .populate({
//         path: "idTorre",
//         select: "nombre",
//       });

//       res.status(201).json(nuevoChequeoCalidad);
//     } catch (err) {
//       console.error(err);
//       res.status(400).json({ error: err.message });
//     }
//   };

// // Actualizar un chequeoCalidad existente
// const chequeoCalidadPut = async (req, res = response) => {
//   const { id } = req.params;
//   const { ...resto } = req.body;
//   console.log(resto);
//   try {
//     const chequeoCalidadActualizado = await ChequeoCalidad.findOneAndUpdate(
//       { _id: id, eliminado: false },
//       resto,
//       { new: true }
//     ).populate({
//       path: "idRefineria",
//       select: "nombre",
//     });

//     if (!chequeoCalidadActualizado) {
//       return res.status(404).json({ msg: "ChequeoCalidad no encontrado" });
//     }

//     res.json(chequeoCalidadActualizado);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   }
// };

// // Eliminar (marcar como eliminado) un chequeoCalidad
// const chequeoCalidadDelete = async (req = request, res = response) => {
//   const { id } = req.params;

//   try {
//       const chequeoCalidad = await ChequeoCalidad.findOneAndUpdate(
//         { _id: id, eliminado: false },
//         { eliminado: true },
//         { new: true }
//       ).populate({
//         path: "idRefineria",
//         select: "nombre",
//       });

//       if (!chequeoCalidad) {
//         return res.status(404).json({ msg: "ChequeoCalidad no encontrado" });
//       }

//       res.json(chequeoCalidad);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   };

// // Parchear un chequeoCalidad (ejemplo básico)
// const chequeoCalidadPatch = (req = request, res = response) => {
//   res.json({
//     msg: "patch API - chequeoCalidadPatch",
//   });
// };

// module.exports = {
//   chequeoCalidadPost,
//   chequeoCalidadGet,
//   chequeoCalidadGets,
//   chequeoCalidadPut,
//   chequeoCalidadDelete,
//   chequeoCalidadPatch,
// };
