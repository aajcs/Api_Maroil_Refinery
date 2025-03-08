const { Schema, model } = require("mongoose");

const ProductoSchema = Schema({
  idRefineria: {
    type: Schema.Types.ObjectId,
    ref: "Refineria",
    required: false,
  },
  nombre: {
    type: String,
    enum: [
      "Nafta",
      "Queroseno",
      "Fuel Oil 4 (MGO)",
      "Fuel Oil 6 (Fondo)",
      "Petroleo Crudo",
    ],
    required: [false, "El nombre del producto es obligatorio"],
  },
  estado: {
    type: Boolean,
    default: true,
    required: true,
  },
  eliminado: {
    type: Boolean,
    default: false,
  },
});

ProductoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Producto", ProductoSchema);
