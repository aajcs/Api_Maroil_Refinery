const { response, request } = require("express");
const Contrato = require("../models/contrato");
const contrato_items = require("../models/contrato_items");

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
        .populate({ path: "id_refineria", select: "nombre" })
        .populate({ path: "id_contacto", select: "nombre" }),
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
    const contrato = await Contrato.findById(id)
      .populate("id_refineria", "nombre")
      .populate("id_contacto", "nombre");

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
// const contratoPost = async (req, res = response) => {
//   const {
//     numeroContrato,
//     descripcion,
//     estado_contrato,
//     id_refineria,
//     id_items,
//     fechaInicio,
//     fechaFin,
//     // cantidad,
//     // precioUnitario,
//     // moneda,
//     condicionesPago,
//     plazo,
//     //  gravedadAPI,
//     // azufre,
//     // viscosidad,
//     //  densidad,
//     //  contenidoAgua,
//     //  origen,
//     destino,
//     //  temperatura,
//     // presion,
//     //  transportista,
//     fechaEnvio,
//     estadoEntrega,
//     clausulas,
//     id_contacto,
//     abono,
//     id_contrato_items,
//   } = req.body;

//   const nuevoContrato = new Contrato({
//     numeroContrato,
//     descripcion,
//     estado_contrato,
//     id_refineria,
//     id_items,
//     fechaInicio,
//     fechaFin,
//     // cantidad,
//     // precioUnitario,
//     // moneda,
//     condicionesPago,
//     plazo,
//     //  gravedadAPI,
//     // azufre,
//     // viscosidad,
//     //  densidad,
//     //  contenidoAgua,
//     //  origen,
//     destino,
//     //  temperatura,
//     // presion,
//     //  transportista,
//     fechaEnvio,
//     estadoEntrega,
//     clausulas,
//     id_contacto,
//     abono,
//     id_contrato_items,
//   });

//   try {
//     await nuevoContrato.save();
//     await nuevoContrato
//       .populate("id_refineria", "nombre")
//       .populate("id_contacto", "nombre")
//       .execPopulate();
//     res.json({
//       nuevoContrato,
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

const contratoPost = async (req, res = response) => {
  const {
    numeroContrato,
    descripcion,
    estado_contrato,
    id_refineria,
    fechaInicio,
    fechaFin,
    condicionesPago,
    plazo,
    destino,
    fechaEnvio,
    estadoEntrega,
    clausulas,
    id_contacto,
    abono,
    items, // Array de objetos item
  } = req.body;

  try {
    // 1. Crear el contrato
    const nuevoContrato = new Contrato({
      numeroContrato,
      descripcion,
      estado_contrato,
      id_refineria,
      fechaInicio,
      fechaFin,
      condicionesPago,
      plazo,
      destino,
      fechaEnvio,
      estadoEntrega,
      clausulas,
      id_contacto,
      abono,
    });

    // 2. Guardar el contrato para obtener el ID
    await nuevoContrato.save();

    // 3. Crear y guardar los items asociados al contrato
    const nuevosItems = await Promise.all(
      items.map(async (item) => {
        const nuevoItem = new contrato_items({
          ...item, // Spread operator para copiar las propiedades del item
          id_contrato: nuevoContrato._id, // Asignar el ID del contrato al item
        });
        return await nuevoItem.save();
      })
    );

    // 4. Actualizar el contrato con los IDs de los items
    nuevoContrato.id_items = nuevosItems.map((item) => item._id);
    await nuevoContrato.save();

    // 5. Populate para obtener los datos de refinería y contacto
    await nuevoContrato
      .populate("id_refineria", "nombre")
      .populate("id_contacto", "nombre")
      .populate("id_contrato_items") // Populate para los items
      .execPopulate();

    res.json({
      nuevoContrato,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un contrato existente
const contratoPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const contratoActualizado = await Contrato.findByIdAndUpdate(id, resto, {
      new: true,
    })
      .populate("id_refineria", "nombre")
      .populate("id_contacto", "nombre");

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
    const contrato = await Contrato.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    );

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
