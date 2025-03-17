const { Schema, model } = require("mongoose");
const Counter = require("./counter");

const ChequeoCalidadSchema = Schema(
  {
    numeroChequeoCalidad: {
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

ChequeoCalidadSchema.pre("save", async function (next) {
  if (this.isNew && this.idBunker) {
    try {
      // Generar la clave del contador específico para cada refinería
      const counterKey = `chequeoCalidad_${this.idBunker.toString()}`;

      // Buscar el contador
      let refineriaCounter = await Counter.findOne({ _id: counterKey });

      // Si el contador no existe, crearlo con el valor inicial de 1000
      if (!refineriaCounter) {
        refineriaCounter = new Counter({ _id: counterKey, seq: 999 });
        await refineriaCounter.save();
      }

      // Incrementar el contador en 1
      refineriaCounter.seq += 1;
      await refineriaCounter.save();

      // Asignar el valor actualizado al campo "numeroChequeoCalidad"
      this.numeroChequeoCalidad = refineriaCounter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = model("ChequeoCalidad", ChequeoCalidadSchema);
