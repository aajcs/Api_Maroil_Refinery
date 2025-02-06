const { Schema, model } = require("mongoose");

const TorreSchema = Schema(
  {
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
        nombre: { type: String, required: false },
        index: { type: Number, required: false },
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

    id_refineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

TorreSchema.methods.toJSON = function () {
  const { _id, ...torre } = this.toObject();
  torre.id = _id;
  return torre;
};

module.exports = model("Torre", TorreSchema);
