const { Schema, model } = require("mongoose");

const RecepcionSchema = new Schema(
  {
    // Relaciones con otros modelos (referencias)
    idContrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
    },
    idContratoItems: {
      type: Schema.Types.ObjectId,
      ref: "ContratoItems",
    },
    idLinea: {
      type: Schema.Types.ObjectId,
      ref: "LineaCarga",
    },
    idBunker: {
      type: Schema.Types.ObjectId,
      ref: "Bunker",
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
    },
    placa: {
      type: String,
    },
    nombreChofer: {
      type: String,
    },
    apellidoChofer: {
      type: String,
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
