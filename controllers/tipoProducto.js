const { response, request } = require("express");
const TipoProducto = require("../models/tipoProducto");
const { Producto } = require("../models");

// Opciones de populate reutilizables
const populateOptions = [
  {
    path: "idProducto",
  },
];

// Obtener todos los chequeos de cantidad con paginación y población de referencias
const tipoProductoGets = async (req = request, res = response) => {
  const query = { estado: true, eliminado: false };

  try {
    const [total, tipoProductos] = await Promise.all([
      TipoProducto.countDocuments(query),
      TipoProducto.find(query).populate(populateOptions),
    ]);

    res.json({
      total,
      tipoProductos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un chequeo de cantidad específico por ID
const tipoProductoGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const tipoProducto = await TipoProducto.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions);

    if (!tipoProducto) {
      return res.status(404).json({ msg: "Chequeo de cantidad no encontrado" });
    }

    res.json(tipoProducto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo chequeo de cantidad
const tipoProductoPost = async (req = request, res = response) => {
  const {
    idRefineria,
    idProducto,
    nombre,
    clasificacion,
    gravedadAPI,
    azufre,
    contenidoAgua,
    flashPoint,
  } = req.body;

  try {
    const nuevoTipoProducto = new TipoProducto({
      idRefineria,
      idProducto,
      nombre,
      clasificacion,
      gravedadAPI,
      azufre,
      contenidoAgua,
      flashPoint,
    });

    await nuevoTipoProducto.save();

    await Producto.findByIdAndUpdate(
      idProducto,
      { $push: { idTipoProducto: nuevoTipoProducto._id } },
      { new: true }
    );

    await nuevoTipoProducto.populate(populateOptions);
    res.status(201).json(nuevoTipoProducto);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un chequeo de cantidad existente
const tipoProductoPut = async (req = request, res = response) => {
  const { id } = req.params;
  const { idProducto, ...resto } = req.body;
  console.log(idProducto);
  try {
    const tipoProductoActualizado = await TipoProducto.findOneAndUpdate(
      { _id: id, eliminado: false },
      resto,
      { new: true }
    ).populate(populateOptions);

    if (!tipoProductoActualizado) {
      return res.status(404).json({ msg: "Tipo de Producto no encontrado" });
    }
    if (idProducto) {
      await Producto.updateMany(
        { idTipoProducto: id },
        { $pull: { idTipoProducto: id } }
      );

      await Producto.findByIdAndUpdate(
        idProducto,
        { $push: { idTipoProducto: id } },
        { new: true }
      );
    }
    res.json(tipoProductoActualizado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar (marcar como eliminado) un chequeo de calidad
const tipoProductoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const tipoProducto = await TipoProducto.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    ).populate(populateOptions);

    if (!tipoProducto) {
      return res.status(404).json({ msg: "Tipo de Producto no encontrado" });
    }
    // Eliminar la referencia en la colección de refinación
    await Refinacion.updateMany(
      { idTipoProducto: id },
      { $pull: { idTipoProducto: id } }
    );

    res.json(tipoProducto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear un chequeo de calidad (ejemplo básico)
const tipoProductoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - tipoProductoPatch",
  });
};

module.exports = {
  tipoProductoGets,
  tipoProductoGet,
  tipoProductoPost,
  tipoProductoPut,
  tipoProductoDelete,
  tipoProductoPatch,
};

// const { response, request } = require("express");
// const TipoProducto = require("../models/tipoProducto");

// // Obtener todos los tipoProductos con paginación y población de referencias
// const populateOptions = [
//   {
//     path: "idRefineria",
//     select: "nombre",
//   },
//   { path: "idProducto" },
// ];
// const tipoProductoGets = async (req = request, res = response) => {
//   const query = { estado: true };

//   try {
//     const [total, tipoProductos] = await Promise.all([
//       TipoProducto.countDocuments(query),
//       TipoProducto.find(query).populate(populateOptions).sort({ posicion: 1 }),
//     ]);

//     res.json({
//       total,
//       tipoProductos,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Obtener un tipoProducto específico por ID
// const tipoProductoGet = async (req = request, res = response) => {
//   const { id } = req.params;

//   try {
//     const tipoProducto = await TipoProducto.findOne({
//       _id: id,
//       estado: true,
//       eliminado: false,
//     }).populate(populateOptions);

//     if (!tipoProducto) {
//       return res.status(404).json({ msg: "TipoProducto no encontrado" });
//     }

//     res.json(tipoProducto);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Crear un nuevo tipoProducto
// const tipoProductoPost = async (req = request, res = response) => {
//   try {
//     const {
//       idRefineria,
//       idProducto,
//       nombre,
//       clasificacion,
//       gravedadAPI,
//       azufre,
//       contenidoAgua,
//       flashPoint,
//     } = req.body;

//     if (!nombre || !idRefineria) {
//       return res
//         .status(400)
//         .json({ error: "Nombre y Refinería son requeridos" });
//     }

//     const nuevoTipoProducto = new TipoProducto({
//       idRefineria,
//       idProducto,
//       nombre,
//       clasificacion,
//       gravedadAPI,
//       azufre,
//       contenidoAgua,
//       flashPoint,
//     });
//     await nuevoTipoProducto.save();
//     await nuevoTipoProducto.populate(populateOptions);

//     res.status(201).json(nuevoTipoProducto);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   }
// };

// // Actualizar un tipoProducto existente
// const tipoProductoPut = async (req, res = response) => {
//   const { id } = req.params;
//   const { ...resto } = req.body;
//   try {
//     const tipoProductoActualizado = await TipoProducto.findOneAndUpdate(
//       { _id: id, eliminado: false },
//       resto,
//       { new: true }
//     ).populate(populateOptions);

//     if (!tipoProductoActualizado) {
//       return res.status(404).json({ msg: "TipoProducto no encontrado" });
//     }

//     res.json(tipoProductoActualizado);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   }
// };

// // Eliminar (marcar como eliminado) un tipoProducto
// const tipoProductoDelete = async (req = request, res = response) => {
//   const { id } = req.params;

//   try {
//     const tipoProducto = await TipoProducto.findOneAndUpdate(
//       { _id: id, eliminado: false },
//       { eliminado: true },
//       { new: true }
//     ).populate(populateOptions);

//     if (!tipoProducto) {
//       return res.status(404).json({ msg: "TipoProducto no encontrado" });
//     }

//     res.json(tipoProducto);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Parchear un tipoProducto (ejemplo básico)
// const tipoProductoPatch = (req = request, res = response) => {
//   res.json({
//     msg: "patch API - tipoProductoPatch",
//   });
// };

// module.exports = {
//   tipoProductoPost,
//   tipoProductoGet,
//   tipoProductoGets,
//   tipoProductoPut,
//   tipoProductoDelete,
//   tipoProductoPatch,
// };
