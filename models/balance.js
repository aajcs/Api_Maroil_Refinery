const { Schema, model } = require("mongoose");

const BalanceSchema = Schema(
  {
    // Relación con el modelo Refineria
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
      
    },

    // Relación con el modelo Contrato para compras
    compra: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contrato",
        required: false,
      },
    ],

    // Relación con el modelo Contrato para ventas
    venta: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contrato",
        required: false,
      },
    ],

    // Monto total del balance
    montoTotal: {
      type: Number,
      required: [true, "El monto total es obligatorio"],
      min: [0, "El monto total no puede ser negativo"], // Validación para evitar valores negativos
    },

    // Estado del balance
    estado: {
      type: String,
      enum: ["true", "false"], // Define los valores permitidos para el campo estado
      default: "true",
      required: true,
    },

    // Eliminación lógica
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
// Método para transformar el objeto devuelto por Mongoose
BalanceSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Balance", BalanceSchema);
