const { Schema, model } = require("mongoose");


const ChequeoCantidadBunkerSchema = Schema(
  {
    numeroChequeoCantidad: {
      type: Number,
    },
    idBunker: {
      type: Schema.Types.ObjectId,
      ref: "Bunker",
      required: true,
    },
    //id del producto (crudo o derivado)
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },

    //Tanque en el que se almacena el Derivado
    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: true,
    },

    //Torre de donde sale el derivado
    idTorre: {
      type: Schema.Types.ObjectId,
      ref: "Torre",
      required: true,
    },

    idRefinacion: {
      type: Schema.Types.ObjectId,
      ref: "Refinacion",
      required: true,
    },
    //Nombre del operador
    operador: {
      type: String,
      required: [false, "El nombre del operador es obligatorio"],
    },
    fechaChequeo: {
      type: Date,
      required: [false, "La fecha del chequeo es obligatoria"],
    },
    //cantidad registrada
    cantidad: {
      type: Number,
      required: [false, "La cantidad registrada es obligatoria"],
    },

    estado: {
      type: String,
      default: true,
      required: true,
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

ChequeoCantidadBunkerSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});



module.exports = model("chequeoCantidadBunker", ChequeoCantidadBunkerSchema);
