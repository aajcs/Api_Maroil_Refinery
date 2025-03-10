const { Schema, model } = require("mongoose");
// Esquema principal de refinación
const RefinacionSchema = new Schema(
  {
    // Relaciones con otros modelos (referencias)
    // idTanque: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Tanque",
    //   required: [true, "El ID del tanque es obligatorio"],
    // },

    idTorre: {
      type: Schema.Types.ObjectId,
      ref: "Torre",
      required: [true, "El ID de la torre es obligatorio"],
    },

    idChequeoCalidad: {
      type: Schema.Types.ObjectId,
      ref: "ChequeoCalidad",
      required: [true, "El ID del chequeo es obligatorio"],
    },
    idChequeoCantidad: {
      type: Schema.Types.ObjectId,
      ref: "ChequeoCantidad",
      required: [true, "El ID del chequeo es obligatorio"],
    },
    cantidadRecibida: {
      type: Number,
      required: [true, "La cantidad recibida es obligatoria"],
    },
    // Información de la refineria
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },

    historialOperaciones: [
      {
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
          duracionHoras: {
            type: Number,
            required: [true, "La duración del proceso es obligatoria"],
          },
        },
        operador: {
          type: String,
          required: [true, "El operador es obligatorio"],
        },
      },
    ],
    material: [
      {
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: [false, "El ID del tanque del derivado es obligatorio"],
        },
        porcentaje: { type: Number, required: false },
        idTanque: {
          type: Schema.Types.ObjectId,
          ref: "Tanque",
          required: [false, "El ID del tanque del derivado es obligatorio"],
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
