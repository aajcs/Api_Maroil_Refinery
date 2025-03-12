const { Schema, model } = require("mongoose");

const ProductoSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },
    nombre: {
      type: String,

      required: [true, "El nombre del producto es obligatorio"],
    },
    posicion: {
      type: Number,
      required: [true, "La posicion del producto es olbigatorio"],
    },
    color: {
      type: String,
      required: [true, "El color del producto es obligatorio"],
    },
    tipoProducto: {
      enum: ["Materia Prima", "Derivado"],
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

ProductoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Producto", ProductoSchema);
