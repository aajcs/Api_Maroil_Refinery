const { Schema, model } = require("mongoose");
const Counter = require("./counter");

// Esquema principal de refinación
const GastoSchema = new Schema(
  {
    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: [true, "El ID de la refinería es obligatorio"], // Campo obligatorio
    },

    concepto: {
      type: String,
      required: [true, "La descripción del proceso es obligatoria"], // Campo obligatorio
      minlength: [5, "La descripción debe tener al menos 10 caracteres"], // Validación de longitud mínima
      maxlength: [50, "La descripción no puede exceder los 200 caracteres"], // Validación de longitud máxima
    },

    // Cantidad total procesada
    cantidad: {
      type: Number,
      min: [0, "La cantidad total no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La cantidad total es obligatoria"], // Campo obligatorio
    },

    // Cantidad total procesada
    monto: {
      type: Number,
      min: [0, "La cantidad total no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La cantidad total es obligatoria"], // Campo obligatorio
    },

    // Descripción del proceso de refinación

    total: {
      type: Number,
      min: [0, "La cantidad total no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La cantidad total es obligatoria"], // Campo obligatorio
    },

    // Fechas del proceso
    fecha: {
      type: Date,
      default: Date.now, // Valor por defecto: fecha actual
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
GastoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    // delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v (si no lo has desactivado en las opciones del esquema)
  },
});

// Exporta el modelo Gasto basado en el esquema definido
module.exports = model("Gasto", GastoSchema);
