const { Schema, model } = require("mongoose");

// Esquema para la asignación de tanques a derivados
const RefinacionSalidaSchema = new Schema(
  {
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
    cantidad: {
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

module.exports = model("RefinacionSalida", RefinacionSalidaSchema);
