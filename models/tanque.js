const { Schema, model } = require("mongoose");

const TanqueSchema = Schema(
  {
    nombre: {
      type: String,
      required: [true, "El Nombre es obligatorio"],
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicación es obligatorio"],
      unique: true,
    },
    capacidad: {
      type: Number,
      required: [true, "La capacidad es obligatoria"],
    },
    material: {
      type: String,
      required: [
        true,
        "El tipo de material que almacena el tanque es obligatorio",
      ],
    },
    almacenamiento: {
      type: Number,
      required: [true, "El porcentaje de almacenamiento es obligatorio"],
    },
    estado: {
      type: String,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },

    id_empresa: {
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

TanqueSchema.methods.toJSON = function () {
  const { _id, ...tanque } = this.toObject();
  tanque.id = _id;
  return tanque;
};

module.exports = model("Tanque", TanqueSchema);
