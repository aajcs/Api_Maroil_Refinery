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
    },
    capacidad: {
      type: Number,
      required: [true, "La capacidad es obligatoria"],
    },
    material: {
      type: [String],
      required: [
        false,
        "El tipo de material que almacena el torre es obligatorio",
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

    idRefineria: {
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

TanqueSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Tanque", TanqueSchema);
