const { Schema, model } = require("mongoose");
const Counter = require("./counter");
// Esquema principal de refinación
const RefinacionSchema = new Schema(
  {
    numeroRefinacion: {
      type: Number,
    },

    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: [true, "El ID de la refinería es obligatorio"],
    },

    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: [true, "El ID del tanque es obligatorio"],
    },

    idTorre: {
      type: Schema.Types.ObjectId,
      ref: "Torre",
      required: [true, "El ID de la torre es obligatorio"],
    },

    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: [true, "El ID del producto es obligatorio"],
    },

    cantidadTotal: {
      type: Number,
      required: [true, "La cantidad total es obligatoria"],
    },

    descripcion: {
      type: String,
      required: [true, "La descripción del proceso es obligatoria"],
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

    derivado: [
      {
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: [true, "El ID del producto del derivado es obligatorio"],
        },
        porcentaje: {
          type: Number,
          required: false,
        },
      },
    ],

    // Estado

    fechaInicio: {
      type: Date,
      default: Date.now,
    },
    fechaFin: {
      type: Date,
    },
    operador: {
      type: String,
      required: [true, "El operador es obligatorio"],
    },

    estadoRefinacion: {
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
RefinacionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});

RefinacionSchema.pre("save", async function (next) {
  if (this.isNew && this.idRefineria) {
    try {
      // Generar la clave del contador específico para cada refinería
      const counterKey = `refinacion_${this.idRefineria.toString()}`;

      // Buscar el contador
      let refineriaCounter = await Counter.findOne({ _id: counterKey });

      // Si el contador no existe, crearlo con el valor inicial de 1000
      if (!refineriaCounter) {
        refineriaCounter = new Counter({ _id: counterKey, seq: 999 });
        await refineriaCounter.save();
      }

      // Incrementar el contador en 1
      refineriaCounter.seq += 1;
      await refineriaCounter.save();

      // Asignar el valor actualizado al campo "numeroRefinacion"
      this.numeroRefinacion = refineriaCounter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = model("Refinacion", RefinacionSchema);
