const { Schema, model } = require("mongoose");
const Counter = require("./counter");

const ChequeoCantidadSchema = Schema(
  {
    // Número de chequeo de cantidad
    numeroChequeoCantidad: {
      type: Number,
    },

    // Relación con el modelo Refineria
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
      
    },

    // Relación con el modelo Producto (crudo o derivado)
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
      
    },

    // Relación con el modelo Tanque
    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: true,
      
    },

    // Relación con el modelo Torre
    idTorre: {
      type: Schema.Types.ObjectId,
      ref: "Torre",
      required: true,
      
    },

    // Relación con el modelo Refinacion
    idRefinacion: {
      type: Schema.Types.ObjectId,
      ref: "Refinacion",
      required: true,
      
    },

    // Nombre del operador
    operador: {
      type: String,
      required: [true, "El nombre del operador es obligatorio"],
      minlength: [3, "El nombre del operador debe tener al menos 3 caracteres"],
      maxlength: [50, "El nombre del operador no puede exceder los 50 caracteres"]
    },
     // Turno del operador
     turno: {
      type: String,
      enum: ["Diurno", "Nocturno"],
      default: "Diurno",
      required: true,
    },

    // Fecha del chequeo
    fechaChequeo: {
      type: Date,
      required: [true, "La fecha del chequeo es obligatoria"],
    },

    // Cantidad registrada
    cantidad: {
      type: Number,
      required: [true, "La cantidad registrada es obligatoria"],
      min: [0, "La cantidad no puede ser negativa"], // Validación para evitar valores negativos
    },

    // Estado del chequeo
    estado: {
      type: String,
      enum: ["true", "false"], // Define los valores permitidos para el campo estado
      default: "true",
      required: true,
    },

    // Eliminación lógica
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

// Método para transformar el objeto devuelto por Mongoose
ChequeoCantidadSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});

// Middleware para incrementar el contador antes de guardar
ChequeoCantidadSchema.pre("save", async function (next) {
  if (this.isNew && this.idRefineria) {
    try {
      // Generar la clave del contador específico para cada refinería
      const counterKey = `chequeoCantidad_${this.idRefineria.toString()}`;

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

      // Asignar el valor actualizado al campo "numeroChequeoCantidad"
      this.numeroChequeoCantidad = refineriaCounter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = model("ChequeoCantidad", ChequeoCantidadSchema);