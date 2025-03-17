const { Schema, model } = require("mongoose");

const BarcazaSchema = Schema(
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
        "El tipo de material que almacena el tanque es obligatorio",
      ],
    },
    almacenamientoMateriaPrimaria: {
      type: Boolean,
      required: [true, "El almacenamiento de materia prima es obligatorio"],
      default: false,
    },
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: [true, "El ID del Producto del derivado es obligatorio"],
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

    idBunker: {
      type: Schema.Types.ObjectId,
      ref: "Bunker",
      required: true,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

BarcazaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Barcaza", BarcazaSchema);
