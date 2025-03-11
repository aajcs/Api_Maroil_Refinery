const { Schema, model } = require("mongoose");

const CostoSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },

    idContrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
      required: true,
    },

    costos: [
      {
        tipoCosto: {
          type: String,
          enum: ["Transporte", "Lubricantes", "Nómina", "Otros"],
          required: [true, "El tipo es obligatorio"],
        },
        monto: {
          type: Number,
          required: [true, "El monto del costo es obligatorio"],
        },
      },
    ],

    costoTotal: {
      type: Number,
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
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false, // Elimina el campo __v
  }
);

CostoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Costo", CostoSchema);
