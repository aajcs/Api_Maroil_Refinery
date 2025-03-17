const { Schema, model } = require("mongoose");
const { stringify } = require("uuid");

const TorreSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },
    nombre: {
      type: String,
      required: [false, "El Nombre es obligatorio"],
    },
    ubicacion: {
      type: String,
      required: [false, "La ubicación es obligatorio"],
    },
    caudal: {
      type: Number,
      required: [false, "El caudal es obligatorio"],
    },
    densidad: {
      type: Number,
      required: [false, "Densidad de torre obligatorio"],
    },
    material: [
      {
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: [false, "El ID del Producto del derivado es obligatorio"],
        },
        estadoMaterial: { type: String, required: false },
      },
    ],
    presion: {
      type: Number,
      required: [false, "La presión es obligatoria"],
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

TorreSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Torre", TorreSchema);
