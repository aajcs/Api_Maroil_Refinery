const { Schema, model } = require("mongoose");
const counter = require("./counter");

// Esquema para la asignación de tanques a derivados
const CorteRefinacionSchema = new Schema(
  {
    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: [true, "El ID de la refinería es obligatorio"], // Campo obligatorio
    },

    // Número único de refinación de salida
    numeroCorteRefinacion: {
      type: Number,
    },

    idTorre: {
      type: Schema.Types.ObjectId,
      ref: "Torre", // Relación con el modelo Torre
      required: [true, "El ID de la torre es obligatorio"], // Campo obligatorio
    },

    detalles: [
      {
        idTanque: {
          type: Schema.Types.ObjectId,
          ref: "Tanque", // Relación con el modelo Tanque
          required: true, // Campo obligatorio
        },
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto", // Relación con el modelo Producto
          required: [true, "El ID del producto es obligatorio"], // Campo obligatorio
        },
        cantidad: {
          type: Number,
          min: [0, "La cantidad total no puede ser negativa"], // Validación para evitar valores negativos
          required: [true, "La cantidad a enviar al tanque es obligatoria"], // Campo obligatorio
        },
      },
    ],

    // Relación con el modelo Refinación
    fechaCorte: {
      type: Date,
      required: true, // Campo obligatorio
    },

    observacion: {
      type: String,
      required: [
        true,
        "La descripción del proceso de refinación es obligatoria",
      ], // Campo obligatorio
      minlength: [3, "La descripción debe tener al menos 10 caracteres"], // Validación de longitud mínima
      maxlength: [200, "La descripción no puede exceder los 200 caracteres"], // Validación de longitud máxima
    },

    // Nombre del operador responsable
    idOperador: {
      type: Schema.Types.ObjectId,
      ref: "Operador", // Relación con el modelo Usuario
      required: [true, "El ID del operador es obligatorio"], // Campo obligatorio
    },

    // Eliminación lógica
    eliminado: {
      type: Boolean,
      default: false, // Valor por defecto
    },

    // Estado general (activo o inactivo)
    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo", // Valor por defecto
    },
  },

  {
    // Agrega automáticamente las propiedades createdAt y updatedAt
    timestamps: true,
    // Elimina la propiedad __v que agrega Mongoose por defecto
    versionKey: false,
  }
);

// Método para transformar el objeto devuelto por Mongoose
CorteRefinacionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});

// Middleware para generar un número único de refinación de salida
CorteRefinacionSchema.pre("save", async function (next) {
  if (this.isNew && this.idRefineria) {
    try {
      // Generar la clave del contador específico para cada refinería
      const counterKey = `refinacionSalida_${this.idRefineria.toString()}`;

      // Buscar el contador
      let refineriaCounter = await counter.findOne({ _id: counterKey });

      // Si el contador no existe, crearlo con el valor inicial de 1000
      if (!refineriaCounter) {
        refineriaCounter = new counter({ _id: counterKey, seq: 999 });
        await refineriaCounter.save();
      }

      // Incrementar el contador en 1
      refineriaCounter.seq += 1;
      await refineriaCounter.save();

      // Asignar el valor actualizado al campo "numeroCorteRefinacion"
      this.numeroCorteRefinacion = refineriaCounter.seq;
      next();
    } catch (error) {
      next(error); // Manejo de errores
    }
  } else {
    next();
  }
});
module.exports = model("CorteRefinacion", CorteRefinacionSchema);
