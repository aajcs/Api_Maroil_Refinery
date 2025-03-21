const { Schema, model } = require("mongoose");

const RecepcionSchema = new Schema(
  {
    // Relaciones con otros modelos (referencias)
    idContrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
      required: [
        true,
        "El ID del Contrato asociado a la recepción es obligatorio",
      ],
    },
    idContratoItems: {
      type: Schema.Types.ObjectId,
      ref: "ContratoItems",
    },
    idLinea: {
      type: Schema.Types.ObjectId,
      ref: "LineaCarga",
    },
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: [
        true,
        "El ID de la Refinería asociada a la recepción es obligatorio",
      ],
    },
    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
    },

    // Información de la recepción
    cantidadRecibida: {
      type: Number,
    },

    cantidadEnviada: {
      type: Number,
      required: [true, "La cantidad enviada es obligatoria"],
    },

    estadoCarga: {
      type: String,
      enum: ["EN_TRANSITO", "ENTREGADO"],
      default: "EN_TRANSITO",
    },
    estado: {
      type: String,
      default: "true",
    },

    // Fechas
    fechaInicio: {
      type: Date,
    },
    fechaFin: {
      type: Date,
    },
    fechaDespacho: {
      type: Date,
    },

    // Información del transporte
    idGuia: {
      type: Number,
      required: [true, "El ID de la Guía es obligatoria"],
    },
    placa: {
      type: String,
      required: [true, "La placa del transporte es obligatoria"],
    },
    nombreChofer: {
      type: String,
      required: [true, "El nombre del chofer es obligatoria"],
    },
    apellidoChofer: {
      type: String,
      required: [true, "El apellido del chofer es obligatoria"],
    },

    // Control de estado (eliminación lógica)
    eliminado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false, // Elimina el campo __v
  }
);

// Método para transformar el objeto devuelto por Mongoose
RecepcionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});

module.exports = model("Recepcion", RecepcionSchema);
