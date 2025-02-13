const { Schema, model } = require("mongoose");

// Esquema para los derivados producidos
const DerivadoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del derivado es obligatorio"],
    enum: ["Gasolina", "Diesel", "Jet Fuel", "Asfalto"], // Lista de derivados
  },
  cantidadProducida: {
    type: Number,
    required: [true, "La cantidad producida es obligatoria"],
  },
  calidad: {
    type: String,
    enum: ["Alta", "Media", "Baja"],
    default: "Alta",
  },
  fechaProduccion: {
    type: Date,
    default: Date.now,
  },
});

// Esquema principal de refinación
const RefinacionSchema = new Schema(
  {
    id_tanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: [true, "El ID del tanque es obligatorio"],
    },
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
    derivados: [DerivadoSchema], // Array de derivados producidos
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
  },
  {
    timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
    versionKey: false, // Evita que se añada el campo __v
  }
);

// Método para eliminar campos sensibles al convertir a JSON
RefinacionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Refinacion", RefinacionSchema);
