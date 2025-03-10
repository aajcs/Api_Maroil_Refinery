const { Schema, model } = require("mongoose");
// Esquema principal de refinación
const RefinacionSchema = new Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },
    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: [true, "El ID del tanque es obligatorio"],
    },

    idTorre: {
      type: Schema.Types.ObjectId,
      ref: "Torre",
      required: [true, "El ID de la torre es obligatorio"],
    },
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: [false, "El ID del tanque del derivado es obligatorio"],
    },
    cantidadTotal: {
      type: Number,
      required: [true, "La cantidad recibida es obligatoria"],
    },
    idChequeoCalidad: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChequeoCalidad",
      },
    ],
    idChequeoCantidad: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChequeoCantidad",
      },
    ],

    // historialOperaciones: [
    //  {
    //   idHistorial: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Historial",
    //     required: [false, "Historiales faltantes"],
    //   },
    // },
    // ],
    derivado: [
      {
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: [false, "El ID del tanque del derivado es obligatorio"],
        },
        porcentaje: { type: Number, required: false },
      },
    ],
    // Estado

    fechaInicio: {
      type: Date,
      default: Date.now,
    },
    fechaFin: {
      type: Date,
    },
    operador: {
      type: String,
      required: [true, "El operador es obligatorio"],
    },

    // Eliminación lógica
    eliminado: {
      type: Boolean,
      default: false,
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false, // Evita que se añada el campo __v
  }
);

// Método para transformar el objeto devuelto por Mongoose
RefinacionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});

module.exports = model("Refinacion", RefinacionSchema);
