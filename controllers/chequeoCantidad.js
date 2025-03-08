const { response, request } = require("express");
const ChequeoCantidad = require("../models/chequeoCantidad");

// Obtener todos los chequeos de cantidad con paginación y población de referencias
const chequeoCantidadGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, chequeoCantidad] = await Promise.all([
      ChequeoCantidad.countDocuments(query),
      ChequeoCantidad.find(query)
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
          select: "ubicacion",
        })
        .populate({
          path: "idRefineria",
          select: "nombre",
        }),
    ]);

    res.json({
      total,
      chequeoCantidad,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de cantidad específico por ID
const chequeoCantidadGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidad = await ChequeoCantidad.findOne({
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
        select: "ubicacion",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      });

    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoCantidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de cantidad
const chequeoCantidadPost = async (req = request, res = response) => {
  const {
    idProducto,
    idTanque,
    idTorre,
    idRefineria,
    operador,
    fechaChequeo,
    cantidad,
  } = req.body;

  try {
    const nuevoChequeoCantidad = new ChequeoCantidad({
      idProducto,
      idTanque,
      idTorre,
      idRefineria,
      operador,
      fechaChequeo,
      cantidad,
    });

    await nuevoChequeoCantidad.save();

    await nuevoChequeoCantidad.populate([
      { path: "idProducto", select: "nombre" },
      { path: "idTanque", select: "nombre" },
      { path: "idTorre", select: "ubicacion" },
      { path: "idRefineria", select: "nombre" },
    ]);

    res.status(201).json(nuevoChequeoCantidad);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de cantidad existente
const chequeoCantidadPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const chequeoCantidadActualizado = await ChequeoCantidad.findOneAndUpdate(
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
        select: "ubicacion",
      })
      .populate({
        path: "idRefineria",
        select: "nombre",
      });

    if (!chequeoCantidadActualizado) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoCantidadActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de cantidad
const chequeoCantidadDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const chequeoCantidad = await ChequeoCantidad.findOneAndUpdate(
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

    if (!chequeoCantidad) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(chequeoCantidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de cantidad (ejemplo básico)
const chequeoCantidadPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - chequeoCantidadPatch",
  });
};

module.exports = {
  chequeoCantidadGets,
  chequeoCantidadGet,
  chequeoCantidadPost,
  chequeoCantidadPut,
  chequeoCantidadDelete,
  chequeoCantidadPatch,
};











// const { response, request } = require("express");
// const ChequeoCantidad = require("../models/chequeoCantidad");

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
