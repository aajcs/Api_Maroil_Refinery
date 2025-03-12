const { Schema, model } = require("mongoose");

const ChequeoCalidadSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
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
    //Caracteristicas del producto (crudo o derivado)
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
    contenidoPlomo: {
      type: String,
      required: [false, "El contenido de plomo es obligatorio"],
    },
    octanaje: {
      type: String,
      required: [false, "El octanaje es obligatorio"],
    },
    temperatura: {
      type: Number,
      required: [false, "La temperatura es obligatoria"],
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

ChequeoCalidadSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("ChequeoCalidad", ChequeoCalidadSchema);
