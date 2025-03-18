const { Schema, model } = require("mongoose");

const lineaCargaBunkerSchema = Schema(
  {
    ubicacion: {
      type: String,
      required: [true, "Fecha de recepción obligatoria"],
    },

    nombre: {
      type: String,
      required: [true, "Nombre de linea obligatorio"],
    },

    idBunker: {
      type: Schema.Types.ObjectId,
      ref: "Bunker",
      required: true,
    },

    estado: {
      type: String,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

lineaCargaBunkerSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
module.exports = model("LineaCargaBunker", lineaCargaBunkerSchema);
