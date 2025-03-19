const { Schema, model } = require("mongoose");

const TipoProductoSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },

    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },

    //CARACTERISTICAS DEL PRODUCTO CALIDAD.
    nombre: {
      type: String,
      required: [true, "El nombre del crudo es obligatorio"],
    },

    clasificacion: {
      type: String,
      enum: ["Liviano", "Mediano", "Pesado"],
      required: [false, "La clasificacion de Crudo es obligatoria"],
    },
    gravedadAPI: {
      type: Number,
      required: [false, "La gravedad API es obligatoria"],
    },
    azufre: {
      type: Number,
      required: [false, "El porcentaje de azufre es obligatorio"],
    },

    contenidoAgua: {
      type: Number,
      required: [false, "El contenido de agua es obligatorio"],
    },

    viscosidad: {
      type: String,
      required: [false, "La viscosidad es obligatoria"],
    },
    origen: {
      type: String,
      required: [false, "El origen es obligatorio"],
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

TipoProductoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("TipoProducto", TipoProductoSchema);
