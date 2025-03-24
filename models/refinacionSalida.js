const { Schema, model } = require("mongoose");
const counter = require("./counter");

// Esquema para la asignación de tanques a derivados
const RefinacionSalidaSchema = new Schema(
  {
    numeroRefinacionSalida: {
      type: Number,
    },
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: [true, "El ID de la refinería es obligatorio"],
    },
    idRefinacion: {
      type: Schema.Types.ObjectId,
      ref: "Refinacion",
      required: true,
    },

    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: true,
    },
    cantidadTotal: {
      type: Number,
      required: [true, "La cantidad a enviar al tanque es obligatoria."],
    },
    descripcion: {
      type: String,
      required: [
        true,
        "La descripción del proceso de refinación es obligatoria.",
      ],
    },

    idChequeoCalidad: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChequeoCalidad",
      },
    ],

    idChequeoCantidad: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChequeoCantidad",
      },
    ],

    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: [false, "El ID del tanque del derivado es obligatorio"],
    },
    operador: {
      type: String,
      required: [true, "El operador es obligatorio"],
    },
    fechaFin: {
      type: Date,
    },
    estadoRefinacionSalida: {
      type: String,
      enum: ["En Cola", "En Proceso", "Finalizado", "Pausado"],
      required: [
        true,
        "Seleccione en que fase se encuentra el proceso de refinación.",
      ],
    },
    // Eliminación lógica

    eliminado: {
      type: Boolean,
      default: false,
    },
    estado: {
      type: String,
      default: true,
    },
  },

  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false, // Evita que se añada el campo __v
  }
);

// Método para transformar el objeto devuelto por Mongoose
RefinacionSalidaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});
RefinacionSalidaSchema.pre("save", async function (next) {
  if (this.isNew && this.idRefineria) {
    try {
      // Generar la clave del contador específico para cada refinería
      const counterKey = `refinacionSalida_${this.idRefineria.toString()}`;

      // Buscar el contador
      let refineriaCounter = await counter.findOne({ _id: counterKey });

      // Si el contador no existe, crearlo con el valor inicial de 1000
      if (!refineriaCounter) {
        refineriaCounter = new counter({ _id: counterKey, seq: 999 });
        await refineriaCounter.save();
      }

      // Incrementar el contador en 1
      refineriaCounter.seq += 1;
      await refineriaCounter.save();

      // Asignar el valor actualizado al campo "numeroRefinacionSalida"
      this.numeroRefinacionSalida = refineriaCounter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
module.exports = model("RefinacionSalida", RefinacionSalidaSchema);
