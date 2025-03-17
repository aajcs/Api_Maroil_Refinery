const { Schema, model } = require("mongoose");

const HistorialSchema = Schema(
  {
    idBunker: {
      type: Schema.Types.ObjectId,
      ref: "Bunker",
      required: true,
    },
    //id refinacion
    idRefinacion: {
      type: Schema.Types.ObjectId,
      ref: "Refinacion",
      required: true,
    },

    operador: {
      type: String,
      required: [false, "El nombre del operador es obligatorio"],
    },
    fecha: {
      type: Date,
      required: [false, "La fecha del chequeo es obligatoria"],
    },

    incidencias: {
      type: String,
    },

    comentarios: {
      type: String,
      required: [true, "Comentarios de la operación necesaria"],
    },

    estado: {
      type: String,
      default: true,
      required: true,
    },
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

HistorialSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Historial", HistorialSchema);
