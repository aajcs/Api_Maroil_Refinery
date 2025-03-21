const { Schema, model } = require("mongoose");

const TipoProductoSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: [true, "El ID de la refinería es obligatorio"],
    },

    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: [true, "El ID del producto es obligatorio"],
    },

    // CARACTERÍSTICAS DEL PRODUCTO - CALIDAD
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
    },

    clasificacion: {
      type: String,
      enum: ["Liviano", "Mediano", "Pesado"],
      required: [true, "La clasificación del producto es obligatoria"],
    },

    gravedadAPI: {
      type: Number,
      required: [true, "La gravedad API del producto es obligatoria"],
    },

    azufre: {
      type: Number,
      required: [true, "El porcentaje de azufre en el producto es obligatorio"],
    },

    contenidoAgua: {
      type: Number,
      required: [true, "El contenido de agua en el producto es obligatorio"],
    },

    flashPoint: {
      type: Number,
      required: [
        true,
        "El punto de inflamación (Flashpoint) del producto es obligatorio",
      ],
    },

    estado: {
      type: String,
      default: "Activo", // Cambié el valor por defecto para que sea más descriptivo.
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

TipoProductoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("TipoProducto", TipoProductoSchema);
