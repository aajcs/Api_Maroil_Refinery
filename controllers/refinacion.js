const { response, request } = require("express");
const Refinacion = require("../models/refinacion");
const Derivado = require("../models/derivados");

// Obtener todas las refinaciones con paginación y población de referencias
const refinacionGets = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { eliminado: false };

  try {
    const [total, refinaciones] = await Promise.all([
      Refinacion.countDocuments(query),
      Refinacion.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .populate({
          path: "idTanque",
          select: "nombre",
        })
        .populate({
          path: "idTorre",
          select: "nombre",
        })
        .populate({
          path: "derivados",
          populate: {
            path: "idTanque",
            select: "nombre"  // Selecciona los campos que deseas obtener del tanque
          }
        })
        .populate({
          path: "idRefineria",
          select: "nombre", // Populate para la refineria
        }),
    ]);

    res.json({
      total,
      refinaciones,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener una refinación específica por ID
const refinacionGet = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findOne({
      _id: id,
      eliminado: false,
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
        path: "derivados",
        populate: {
          path: "idTanque",
          select: "nombre"  // Selecciona los campos que deseas obtener del tanque
        }
      })
      .populate({
        path: "idRefineria",
        select: "nombre", // Populate para la refineria
      });

    if (!refinacion) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const refinacionPost = async (req = request, res = response) => {
  const {
    idTanque,
    idTorre,
    idRefineria,
    materiaPrima,
    cantidadRecibida,
    fechaRecepcion,
    proceso,
    fechaInicio,
    fechaFin,
    temperatura,
    presion,
    duracionHoras,
    derivados, // Asegúrate de que este campo esté correctamente nombrado en req.body
    controlCalidad,
    observaciones,
    fechaRevision,
    historialOperaciones,
    fecha,
    operacion,
    usuario,
    estado,
  } = req.body;

  try {
    // Crear la nueva refinación
    const nuevaRefinacion = new Refinacion({
      idTanque,
      idTorre,
      idRefineria,
      materiaPrima,
      cantidadRecibida,
      fechaRecepcion,
      proceso,
      fechaInicio,
      fechaFin,
      temperatura,
      presion,
      duracionHoras,
      // derivados,
      controlCalidad,
      observaciones,
      fechaRevision,
      historialOperaciones,
      fecha,
      operacion,
      usuario,
      estado,
    });

    // Guardar la refinación en la base de datos
    await nuevaRefinacion.save();

    // Verificar que el campo derivados esté definido y sea un array
    if (Array.isArray(derivados)) {
      // Crear y guardar los derivados asociados a la refinación
      const nuevosDerivados = await Promise.all(
        derivados.map(async (derivado) => {
          const nuevoDerivado = new Derivado({
            ...derivado, // Spread operator para copiar las propiedades del derivado
            idRefinacion: nuevaRefinacion._id, // Asignar el ID de refinación al derivado
          });
          return await nuevoDerivado.save();
        })
      );

      // Actualizar la refinación con los IDs de los derivados
      nuevaRefinacion.derivados = nuevosDerivados.map(
        (derivado) => derivado._id
      );
      await nuevaRefinacion.save();
    }

    // Obtener la refinación con las referencias pobladas
    const refinacionPoblada = await Refinacion.findById(nuevaRefinacion._id)
      .populate({
        path: "idTanque",
        select: "nombre", // Selecciona solo el campo "nombre" del tanque
      })
      .populate({
        path: "idTorre",
        select: "nombre", // Selecciona solo el campo "nombre" de la torre
      })
      .populate({
        path: "derivados",
        populate: {
          path: "idTanque",
          select: "nombre"  // Selecciona los campos que deseas obtener del tanque
        }
      })
      // .populate({
      //   path: "derivados", // Populate para los derivados
      // })
      .populate({
        path: "idRefineria",
        select: "nombre", // Populate para la refineria
      });

    // Responder con el documento poblado
    res.status(201).json({
      message: "Refinación creada exitosamente",
      refinacion: refinacionPoblada,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar una refinación existente
const refinacionPut = async (req = request, res = response) => {
const { id } = req.params;
  const { _id, ...resto } = req.body;
   try {
    const refinacionActualizada = await Refinacion.findByIdAndUpdate(id, resto, {
      new: true},
      )
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      })
      .populate({
        path: "derivados",
        populate: {
          path: "idTanque",
          select: "nombre"  // Selecciona los campos que deseas obtener del tanque
        }
      })
      .populate({
        path: "idRefineria",
        select: "nombre", // Populate para la refineria
      });

    if (!refinacionActualizada) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }
    req.io.emit("refinacion-modificada", refinacionActualizada);
    res.json(refinacionActualizada);
  } catch (err) {
    res.status(400).json({ error: "mierda"});
  }
};

// Eliminar (marcar como eliminado) una refinación
const refinacionDelete = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const refinacion = await Refinacion.findOneAndUpdate(
      { _id: id, eliminado: false },
      { eliminado: true },
      { new: true }
    )
      .populate({
        path: "idTanque",
        select: "nombre",
      })
      .populate({
        path: "derivados",
        populate: {
          path: "idTanque",
          select: "nombre"  // Selecciona los campos que deseas obtener del tanque
        }
      })
      .populate({
        path: "idTorre",
        select: "nombre",
      });

    if (!refinacion) {
      return res.status(404).json({ msg: "Refinación no encontrada" });
    }

    res.json(refinacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Parchear una refinación (ejemplo básico)
const refinacionPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - refinacionPatch",
  });
};

module.exports = {
  refinacionPost,
  refinacionGet,
  refinacionGets,
  refinacionPut,
  refinacionDelete,
  refinacionPatch,
};
