const { Schema, model } = require("mongoose");

const lineaCargaSchema = Schema(
  {
    ubicacion: {
      type: String,
      required: [true, "Fecha de recepción obligatoria"],
    },

    nombre: {
      type: String,
      required: [true, "Nombre de linea obligatorio"],
    },

    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
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

lineaCargaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
module.exports = model("LineaCarga", lineaCargaSchema);
