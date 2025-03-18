const { Schema, model } = require("mongoose");

const BalanceBunkerSchema = Schema(
  {
    idBunker: {
      type: Schema.Types.ObjectId,
      ref: "Bunker",
      required: true,
    },

    compra: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contrato",
        required: false,
      },
    ],

    venta: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contrato",
        required: false,
      },
    ],

    montoTotal: {
      type: Number,
      required: [true, "El monto total es obligatorio"],
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

BalanceBunkerSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("balanceBunker", BalanceBunkerSchema);
