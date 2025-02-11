const { Schema, model } = require("mongoose");

const Contrato_itemsSchema = Schema(
  {
    id_contrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
      required: false,
    },
    id_refineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },
    id_contacto: {
      type: Schema.Types.ObjectId,
      ref: "Contacto",
      required: false,
    },
    producto: {
      type: String,
      enum: [
        "Crudo Ligero",
        "Crudo Pesado",
        "Diesel",
        "Gasolina",
        "Jet Fuel",
        "Otros",
      ],
      required: [false, "El producto es obligatorio"],
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
    historialModificaciones: [
      {
        fecha: { type: Date, default: Date.now },
        usuario: { type: String, required: true },
        cambios: { type: String, required: true },
      },
    ],
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
    timestamps: true,
    versionKey: false,
  }
);
Contrato_itemsSchema.methods.toJSON = function () {
  const { _id, ...contrato } = this.toObject();
  contrato.id = _id;
  return contrato_items;
};

module.exports = model("Contrato_items", Contrato_itemsSchema);
