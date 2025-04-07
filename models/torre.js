const { Schema, model } = require("mongoose");
// La importación de stringify no se utiliza, puedes eliminarla si no es necesaria
const { stringify } = require("uuid");

// Definición del esquema para el modelo Torre
const TorreSchema = Schema(
  {
    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: true, // Campo obligatorio
    },

    // Nombre de la torre
    nombre: {
      type: String,
      required: [false, "El Nombre es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Ubicación física de la torre dentro de la refinería
    ubicacion: {
      type: String,
      required: [false, "La ubicación es obligatoria"], // Campo obligatorio
      //maxlength: [100, "La ubicación no puede exceder los 100 caracteres"], // Validación de longitud máxima
    },

    // Caudal de la torre (opcional)
    // caudal: {
    //   type: Number,
    //   min: [0, "El caudal no puede ser negativo"], // Validación para evitar valores negativos
    //   required: false, // Campo opcional
    // },

    // // Densidad de los materiales procesados en la torre (opcional)
    // densidad: {
    //   type: Number,
    //   min: [0, "La densidad no puede ser negativa"], // Validación para evitar valores negativos
    //   required: false, // Campo opcional
    // },

    // // Presión de operación de la torre (opcional)
    // presion: {
    //   type: Number,
    //   min: [0, "La presión no puede ser negativa"], // Validación para evitar valores negativos
    //   required: false, // Campo opcional
    // },

    // Materiales procesados en la torre
    material: [
      {
        // Relación con el modelo Producto
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto", // Relación con el modelo Producto
          required: [false, "El ID del Producto del derivado es obligatorio"], // Campo obligatorio
        },
        // Estado del material procesado
        estadoMaterial: {
          type: String,

          required: false, // Campo opcional
        },
      },
    ],

    // Estado de la torre (activo o inactivo)
    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo", // Valor por defecto
    },

    // Indica si la torre ha sido eliminada (eliminación lógica)
    eliminado: {
      type: Boolean,
      default: false, // Valor por defecto
    },
  },

  {
    // Agrega automáticamente las propiedades createdAt y updatedAt
    timestamps: true,
    // Elimina la propiedad __v que agrega Mongoose por defecto
    versionKey: false,
  }
);

// Configuración para transformar el objeto JSON al devolverlo
TorreSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Cambia _id a id
    // delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v
  },
});

// Exporta el modelo Torre basado en el esquema definido
module.exports = model("Torre", TorreSchema);
