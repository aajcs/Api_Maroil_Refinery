const { Schema, model } = require("mongoose");
// Esquema principal de refinación
const RefinacionSchema = new Schema(
  {
    // Relaciones con otros modelos (referencias)
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

    // idDerivados: [{ type: Schema.Types.ObjectId, ref: "Derivados" }], // Array de IDs,
    derivados: [{ type: Schema.Types.ObjectId, ref: "Derivado" }],
    estado: {
      type: Boolean,
      default: true,
    },

    // Información de la materia prima
    materiaPrima: {
      tipo: {
        type: String,
        required: [true, "El tipo de materia prima es obligatorio"],
        enum: ["Crudo Ligero", "Crudo Pesado"],
      },
      cantidadRecibida: {
        type: Number,
        required: [true, "La cantidad recibida es obligatoria"],
      },
      fechaRecepcion: {
        type: Date,
        default: Date.now,
      },
    },
    
    // Información del proceso
    proceso: {
      fechaInicio: {
        type: Date,
        default: Date.now,
      },
      fechaFin: {
        type: Date,
      },
      temperatura: {
        type: Number,
        required: [true, "La temperatura del proceso es obligatoria"],
      },
      presion: {
        type: Number,
        required: [true, "La presión del proceso es obligatoria"],
      },
      duracionHoras: {
        type: Number,
        required: [true, "La duración del proceso es obligatoria"],
      },
    },
    

    // // Chequeos cada 24 horas
    // chequeos: [ChequeoSchema], // Array de registros de chequeo cada 24 horas

    // Control de calidad
    controlCalidad: {
      aprobado: {
        type: Boolean,
        default: false,
      },
      observaciones: {
        type: String,
      },
      fechaRevision: {
        type: Date,
        default: Date.now,
      },
    },

    // Historial de operaciones
    historialOperaciones: [
      {
        fecha: {
          type: Date,
          default: Date.now,
        },
        operacion: {
          type: String,
          required: [true, "La operación es obligatoria"],
        },
        usuario: {
          type: String,
          required: [true, "El usuario es obligatorio"],
        },
      },
    ],

    // Estado
    estado: {
      type: Boolean,
      default: true,
    },

    // Eliminación lógica
    eliminado: {
      type: Boolean,
      default: false,
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

module.exports = model("Refinacion", RefinacionSchema);
