const { response, request } = require("express");
const DespachoBK = require("../../models/bunkering/despachoBK");

// Opciones de población reutilizables para consultas
const populateOptions = [
  {
    path: "idContrato",   // Relación con el modelo Contrato
    select: "idItems numeroContrato",   // Selecciona los campos idItems y numeroContrato
    populate: {
      path: "idItems",  // Relación con los ítems del contrato
      populate: [
        { path: "producto", select: "nombre" }, // Relación con el modelo Producto
        { path: "idTipoProducto", select: "nombre" }, // Relación con el modelo TipoProducto
      ],
    },
  },
  { path: "idContratoItems", populate: { path: "producto", select: "nombre" } },
  { path: "idLinea", select: "nombre" },
  { path: "idBunkering", select: "nombre" },
  { path: "idMuelle", select: "nombre" },
  { path: "idEmbarcacion", select: "nombre" },
  { path: "idProducto", select: "nombre" },
  { path: "idTanque", select: "nombre" },
  { path: "idChequeoCalidad" },
  { path: "idChequeoCantidad" },
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Obtener todos los despachos con población de referencias ordenados
const despachoBKGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  try {
    const [total, despachos] = await Promise.all([
      DespachoBK.countDocuments(query),
      DespachoBK.find(query).populate(populateOptions),
    ]);
    
    // Ordenar historial por fecha descendente en cada despacho
    despachos.forEach((t) => {
      if (Array.isArray(t.historial)) {
        t.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    });
    // Emitir evento de socket para notificar a los clientes
    res.json({ total, despachos });
  } catch (err) {
    console.error("Error en despachoBKGets:", err);
    res.status(500).json({ error: "Error interno del servidor al obtener las despachos.",});
  }
};

// Obtener un despacho específica por ID
const despachoBKGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const despacho = await DespachoBK.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!despacho) {
      return res.status(404).json({
        msg: "Despacho no encontrado",
      });
    }
    // Ordenar historial por fecha descendente
    if (Array.isArray(despacho.historial)) {
      despacho.historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    res.json(despacho);
  } catch (err) {
    console.error("Error en despachoBKGet:", err);
    res.status(500).json({
      error: "Error interno del servidor al obtener el despacho.",
    });
  }
};

// Crear un nuevo despacho
const despachoBKPost = async (req, res = response) => {
  const {
    idContrato,
    idContratoItems,
    idLinea,
    idMuelle,
    idBunkering,
    idEmbarcacion,  
    idProducto,
    idTanque,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoDespacho,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioDespacho,
    fechaFinDespacho,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    muelle,
    bunkering,
    tractomula,
    idGuia,
    placa,
    tipo,
    nombreChofer,
  } = req.body;

  try {
  const nuevaDespacho = new DespachoBK({
    idContrato,
    idContratoItems,
    idLinea,
    idBunkering,
    idEmbarcacion,
    idMuelle,
    idProducto, 
    idTanque,
    idChequeoCalidad,
    idChequeoCantidad,
    cantidadRecibida,
    cantidadEnviada,
    estadoDespacho,
    estadoCarga,
    estado,
    fechaInicio,
    fechaFin,
    fechaInicioDespacho,
    fechaFinDespacho,
    fechaSalida,
    fechaLlegada,
    fechaDespacho,
    idGuia,
    placa,
    tipo,
    tractomula,
    muelle,   
    bunkering,
    nombreChofer,
    createdBy: req.usuario._id,
  });

    await nuevoDespacho.save();
    await nuevoDespacho.populate(populateOptions);
    res.status(201).json({ despacho: nuevoDespacho }); // Responde con el despacho creado
  } catch (err) {
    console.error("Error en despachoBKPost:", err);
    res.status(400).json({ error: "Error al crear el despacho. Verifica los datos proporcionados.", });
  }
};

// Actualizar un despacho existente
const despachoBKPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const antes = await DespachoBK.findById(id);
    if (!antes) {
      return res.status(404).json({ msg: "Despacho no encontrada" });
    }
        
    const cambios = {};
    for (let key in resto) {
      if (String(antes[key]) !== String(resto[key])) {
        cambios[key] = { from: antes[key], to: resto[key] };
      }
    }
    // Si no hay cambios, no se actualiza el despacho 
    const despachoACtualizado = await DespachoBK.findByIdAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!despachoACtualizado) {
      return res.status(404).json({ msg: "Despacho no encontrado",});
    }
   
    res.json(despachoACtualizado);
  } catch (err) {
    console.error("Error en despachoBKPut:", err);
    res.status(400).json({ error: "Error al actualizar el despacho. Verifica los datos proporcionados.", });
  }
};

// Eliminar (marcar como eliminado) un Despacho
const despachoBKDelete = async (req, res = response) => {
  const { id } = req.params;
  try {
    const antes = await DespachoBK.findById(id);
     if (!antes) {
      return res.status(404).json({ msg: "Despacho no encontrado" });
  }
    // Verifica si el despacho ya está eliminado
      const cambios = { eliminado: { from: antes.eliminado, to: true } };
    
      const despachoEliminado = await DespachoBK.findByIdAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: { historial: { modificadoPor: req.usuario._id, cambios } },
      },
      { new: true }
    ).populate(populateOptions);

    if (!despacho) {
      return res.status(404).json({ msg: "Despacho no encontrada",});
    }

    res.json(despachoEliminado);
  } catch (err) {
   console.error("Error en despachoBKDelete:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el despacho.",
    });
  }
};

// Controlador para manejar actualizaciones parciales (PATCH)
const despachoBKPatch = async (req = request, res = response) => {
 const { id } = req.params;
  const { ...resto } = req.body;
  // Aquí puedes implementar la lógica para manejar actualizaciones parciales
 
 
 try {
     const despachoActualizado = await DespachoBK.findOneAndUpdate(
       { _id: id, eliminado: false },
       { $set: resto },
       { new: true }
     ).populate(populateOptions);
 
     if (!despachoActualizado) {
       return res.status(404).json({ msg: "Despacho no encontrado" });
     }
 
     res.json(despachoActualizado);
   } catch (err) {
     console.error("Error en despachoBKPatch:", err);
     res.status(500).json({
       error:
         "Error interno del servidor al actualizar parcialmente el despacho.",
     });
   }
  };

// Exportar los controladores
module.exports = {
  despachoBKPost,
  despachoBKGet,
  despachoBKGets,
  despachoBKPut,
  despachoBKDelete,
  despachoBKPatch,
};