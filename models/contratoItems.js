const { Schema, model } = require("mongoose");
const ContratoItemsSchema = Schema({
  producto: {
    type: Schema.Types.ObjectId,
    ref: "Producto",
    required: [false, "El ID del tanque del derivado es obligatorio"],
  },

  cantidad: {
    type: Number,
    required: [false, "La cantidad es obligatoria"],
  },
  precioUnitario: {
    type: Number,
    required: [false, "El precio unitario es obligatorio"],
  },
  gravedadAPI: {
    type: Number,
    required: [false, "La gravedad API es obligatoria"],
  },
  azufre: {
    type: Number,
    required: [false, "El porcentaje de azufre es obligatorio"],
  },
  viscosidad: {
    type: Number,
    required: [false, "La viscosidad es obligatoria"],
  },
  densidad: {
    type: Number,
    required: [false, "La densidad es obligatoria"],
  },
  contenidoAgua: {
    type: Number,
    required: [false, "El contenido de agua es obligatorio"],
  },
  origen: {
    type: String,
    required: [false, "El origen es obligatorio"],
  },

  temperatura: {
    type: Number,
    required: [false, "La temperatura es obligatoria"],
  },
  presion: {
    type: Number,
    required: [false, "La presión es obligatoria"],
  },
  idContrato: {
    type: Schema.Types.ObjectId,
    ref: "Contrato",
    required: false,
  },

  estado: {
    type: String,
    default: true,
  },
  eliminado: {
    type: Boolean,
    default: false,
  },
});

ContratoItemsSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("ContratoItems", ContratoItemsSchema);
